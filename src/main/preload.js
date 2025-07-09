const { contextBridge, ipcRenderer } = require('electron')

/**
 * 安全的 IPC 通道名称列表
 */
const VALID_CHANNELS = [
  'recording-started',
  'recording-stopped',
  'hide-window',
  'set-recording-state',
  'start-recording',
  'stop-recording',
  'result-data',
]

/**
 * 验证 IPC 通道名称
 * @param {string} channel - IPC 通道名称
 * @throws {Error} 如果通道名称无效
 */
function validateChannel(channel) {
  if (!VALID_CHANNELS.includes(channel)) {
    throw new Error(`Invalid IPC channel: ${channel}`)
  }
}

/**
 * 暴露安全的 API 给渲染进程
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // 录音控制
  startRecording: async () => {
    validateChannel('recording-started')
    await ipcRenderer.invoke('recording-started')
    ipcRenderer.send('set-recording-state', true)
  },

  stopRecording: async () => {
    validateChannel('recording-stopped')
    await ipcRenderer.invoke('recording-stopped')
    ipcRenderer.send('set-recording-state', false)
  },

  // 窗口控制
  hideWindow: () => {
    validateChannel('hide-window')
    ipcRenderer.send('hide-window')
  },

  // 监听主进程事件
  onStartRecording: (callback) => {
    validateChannel('start-recording')
    ipcRenderer.on('start-recording', (event, ...args) => callback(...args))
  },

  onStopRecording: (callback) => {
    validateChannel('stop-recording')
    ipcRenderer.on('stop-recording', (event, ...args) => callback(...args))
  },

  onResultData: (callback) => {
    validateChannel('result-data')
    ipcRenderer.on('result-data', (event, ...args) => callback(...args))
  },

  // 移除监听器
  removeAllListeners: (channel) => {
    validateChannel(channel)
    ipcRenderer.removeAllListeners(channel)
  },
})

/**
 * 暴露语音识别API
 */
contextBridge.exposeInMainWorld('speechAPI', {
  // 检查浏览器是否支持语音识别
  isSupported: () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  },

  // 创建语音识别实例
  createRecognition: () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'zh-CN'
      return recognition
    }
    return null
  },
})
