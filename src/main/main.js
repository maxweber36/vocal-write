const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  globalShortcut,
  ipcMain,
} = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const fs = require('fs')
const dotenv = require('dotenv')

let mainWindow = null
let tray = null
let isRecording = false
let isQuitting = false

/**
 * 创建主窗口
 */
function createWindow() {
  if (mainWindow) {
    mainWindow.focus()
    return
  }

  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    show: true,
    frame: true,
    movable: true,
    alwaysOnTop: true,
    transparent: false,
    backgroundColor: '#ffffff',
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
  } else {
    // In production, the URL is loaded in the whenReady event, after the Next.js server has started.
  }

  // 监听窗口关闭事件，隐藏到托盘而不是退出应用
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
    // 如果是 quitting，就让它正常关闭
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

/**
 * 创建系统托盘
 */
function createTray() {
  if (tray) {
    tray.destroy()
  }
  const { nativeImage } = require('electron')
  // 根据开发环境和生产环境设置不同的图标路径
  const iconName = 'tray-icon.png'
  const iconPath = isDev
    ? path.join(__dirname, `../assets/${iconName}`)
    : path.join(process.resourcesPath, `assets/${iconName}`)

  try {
    const image = nativeImage.createFromPath(iconPath)
    if (image.isEmpty()) {
      console.error('[Tray] Failed to load image, it is empty.')
      tray = new Tray(nativeImage.createEmpty())
    } else {
      tray = new Tray(image.resize({ width: 16, height: 16 }))
      console.log('[Tray] Tray created successfully.')
    }
  } catch (error) {
    console.error(`[Tray] Could not load tray icon: ${iconPath}`, error)
    tray = new Tray(nativeImage.createEmpty())
  }

  updateTrayMenu()
  tray.setToolTip('Vocal Write - 语音转文字工具')

  // 点击托盘图标显示窗口
  tray.on('click', () => {
    showMainWindow()
  })
}

/**
 * 显示主窗口
 */
function showMainWindow() {
  if (mainWindow) {
    if (mainWindow.isVisible()) {
      mainWindow.focus()
    } else {
      mainWindow.show()
    }
  } else {
    createWindow()
  }
}

/**
 * 开始录音
 */
/**
 * 切换录音状态
 */
function toggleRecording() {
  if (mainWindow) {
    if (mainWindow.isVisible()) {
      mainWindow.webContents.send('toggle-recording')
      mainWindow.focus()
    } else {
      // If window is hidden, wait for it to be shown before sending the message.
      showMainWindow()
      mainWindow.once('show', () => {
        mainWindow.webContents.send('toggle-recording')
      })
      mainWindow.focus()
    }
  }
}

/**
 * 更新托盘菜单
 */
function updateTrayMenu() {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        showMainWindow()
      },
    },
    {
      label: isRecording ? '停止录音 (⌘+R)' : '开始录音 (⌘+R)',
      accelerator: 'Command+R',
      click: () => {
        toggleRecording()
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)
}

/**
 * 注册全局热键
 */
function registerGlobalShortcuts() {
  // 注册 Option+Space 热键
  // 注册 Command+R 热键
  const ret = globalShortcut.register('Command+R', () => {
    toggleRecording()
  })

  if (!ret) {
    console.log('全局热键注册失败')
  }
}

// 应用事件处理
// 在生产环境中加载环境变量
if (!isDev) {
  const envPath = path.join(process.resourcesPath, '.env.production')
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
  } else {
    console.error('.env.production not found in resources path')
  }
}

app.whenReady().then(() => {
  // IPC for config management
  ipcMain.handle('get-config', (event) => {
    if (!isDev) {
      const envPath = path.join(process.resourcesPath, '.env.production')
      if (fs.existsSync(envPath)) {
        const envConfig = dotenv.parse(fs.readFileSync(envPath))
        return envConfig
      } else {
        return {}
      }
    } else {
      const envPath = path.join(__dirname, '../../.env.local')
      if (fs.existsSync(envPath)) {
        const envConfig = dotenv.parse(fs.readFileSync(envPath))
        return envConfig
      } else {
        return {}
      }
    }
  })

  ipcMain.handle('save-config', (event, config) => {
    const envPath = isDev
      ? path.join(__dirname, '../../.env.local')
      : path.join(process.resourcesPath, '.env.production')

    const envContent = Object.entries(config)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    try {
      fs.writeFileSync(envPath, envContent)
      // Update current process env
      Object.assign(process.env, config)
      return { success: true }
    } catch (error) {
      console.error('Failed to save config:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.on('recording-state-changed', (event, newIsRecording) => {
    isRecording = newIsRecording
    updateTrayMenu()
  })

  if (!isDev) {
    const next = require('next')
    const nextApp = next({ dev: false, dir: path.join(__dirname, '../..') })
    nextApp
      .prepare()
      .then(() => {
        createWindow()
        createTray()
        registerGlobalShortcuts()

        const server = require('http').createServer((req, res) => {
          const handle = nextApp.getRequestHandler()
          handle(req, res)
        })

        server.listen(3000, (err) => {
          if (err) throw err
          console.log('> Ready on http://localhost:3000')
          mainWindow.loadURL('http://localhost:3000')
        })
      })
      .catch((err) => {
        console.error('Error starting Next.js server', err)
      })
  } else {
    createWindow()
    createTray()
    registerGlobalShortcuts()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('window-all-closed', () => {
  // 在 macOS 上，保持应用运行即使所有窗口都关闭了
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll()
})

// IPC 事件处理
ipcMain.handle('recording-started', () => {
  isRecording = true
  updateTrayMenu() // 更新托盘菜单
})

ipcMain.handle('recording-stopped', () => {
  isRecording = false
  updateTrayMenu() // 更新托盘菜单
})

ipcMain.handle('hide-window', () => {
  if (mainWindow) {
    mainWindow.hide()
  }
})

ipcMain.on('set-recording-state', (event, state) => {
  isRecording = state
})

ipcMain.on('hide-window', () => {
  if (mainWindow) {
    mainWindow.hide()
  }
})
