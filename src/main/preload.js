const { contextBridge, ipcRenderer } = require('electron')

// 定义安全的、允许通信的事件通道列表
const VALID_CHANNELS = ['toggle-recording', 'recording-state-changed']

// 通过 contextBridge 暴露一个安全的、精简版的 ipcRenderer 给渲染进程
contextBridge.exposeInMainWorld('ipcRenderer', {
  /**
   * 向主进程发送消息
   * @param {string} channel - 通道名称
   * @param {*} data - 发送的数据
   */
  send: (channel, data) => {
    if (VALID_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },

  /**
   * 监听从主进程发来的消息
   * @param {string} channel - 通道名称
   * @param {Function} listener - 事件处理函数
   */
  on: (channel, listener) => {
    if (VALID_CHANNELS.includes(channel)) {
      // 创建一个新的函数来包装原始监听器，以避免暴露 Electron 的 `event` 对象
      const subscription = (event, ...args) => listener(...args)
      ipcRenderer.on(channel, subscription)

      // 返回一个取消订阅的函数，方便在组件卸载时清理
      return () => {
        ipcRenderer.removeListener(channel, subscription)
      }
    }
  },

  /**
   * 移除指定的监听器
   * @param {string} channel - 通道名称
   * @param {Function} listener - 要移除的事件处理函数
   */
  removeListener: (channel, listener) => {
    if (VALID_CHANNELS.includes(channel)) {
      ipcRenderer.removeListener(channel, listener)
    }
  },
})
