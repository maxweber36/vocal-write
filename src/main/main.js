const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  globalShortcut,
  ipcMain,
  dialog,
} = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')

let mainWindow = null
let tray = null
let isRecording = false

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
    height: 800,
    show: true,
    frame: false,
    movable: true,
    alwaysOnTop: true,
    transparent: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  const startUrl = isDev
    ? 'http://localhost:8889'
    : `file://${path.join(__dirname, '../../out/index.html')}`

  mainWindow.loadURL(startUrl)

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
  console.log(`[Tray] Icon path: ${iconPath}`) // 记录图标路径

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

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        showMainWindow()
      },
    },
    {
      label: '开始录音 (⌥+Space)',
      click: () => {
        startRecording()
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)
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
function startRecording() {
  isRecording = true
  showMainWindow()
  mainWindow.webContents.send('start-recording')
}

/**
 * 停止录音
 */
function stopRecording() {
  isRecording = false
  mainWindow.webContents.send('stop-recording')
}

/**
 * 注册全局热键
 */
function registerGlobalShortcuts() {
  // 注册 Option+Space 热键
  const ret = globalShortcut.register('Alt+Space', () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  })

  if (!ret) {
    console.log('全局热键注册失败')
  }
}

// 应用事件处理
app.whenReady().then(() => {
  createWindow()
  createTray()
  registerGlobalShortcuts()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
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
})

ipcMain.handle('recording-stopped', () => {
  isRecording = false
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
