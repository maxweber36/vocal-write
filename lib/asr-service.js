/**
 * @fileoverview 封装腾讯云实时语音识别服务的模块
 */
import { getSignedUrl } from './api'
import { cleanup } from './utils'

/**
 * 创建并管理与腾讯云 ASR 服务的 WebSocket 连接和音频处理。
 * @param {object} config - 配置对象。
 * @param {function(string): void} config.onTranscriptChange - 最终识别结果变化时的回调。
 * @param {function(string): void} config.onInterimTranscriptChange - 临时识别结果变化时的回调。
 * @param {function(boolean): void} config.onRecordingStateChange - 录音状态变化时的回调。
 * @param {function(number): void} config.onAudioLevelChange - 音频音量变化时的回调。
 * @param {function(string): void} config.onError - 发生错误时的回调。
 * @returns {object} - 包含 start, stop, pause, resume 方法的对象。
 */
const DEFAULT_AUDIO_CONFIG = {
  sampleRate: 16000,
  channelCount: 1,
  bufferSize: 1024,
}

export function createAsrService(config) {
  const { onStateChange, ...restConfig } = config
  const {
    onTranscriptChange,
    onInterimTranscriptChange,
    onRecordingStateChange,
    onAudioLevelChange,
    onError,
    onStop,
    audioConfig: userAudioConfig,
  } = restConfig

  const audioConfig = { ...DEFAULT_AUDIO_CONFIG, ...userAudioConfig }

  let ws = null
  let audioContext = null
  let audioWorkletNode = null
  let mediaStream = null
  let isRecording = false
  let isPaused = false
  let isStopping = false
  let currentTranscript = ''

  /**
   * 开始录音和识别流程。
   */
  async function start() {
    if (isRecording) return

    // 重置状态
    currentTranscript = ''
    isStopping = false

    try {
      // 1. 从后端获取带签名的 URL
      const url = await getSignedUrl()

      // 2. 初始化 WebSocket
      ws = new WebSocket(url)
      ws.onopen = () => {
        console.log('WebSocket connection successful')
        isRecording = true
        isPaused = false
        onRecordingStateChange(true)
        onStateChange?.('connected')
      }
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.code !== 0) {
          const errorMessage = `ASR Error: ${data.message} (code: ${data.code})`
          console.error(errorMessage)
          onError(errorMessage)
          _cleanup()
          return
        }

        if (data.result) {
          const { slice_type, voice_text_str } = data.result
          if (slice_type === 2) {
            // 稳态结果
            currentTranscript += voice_text_str
            onTranscriptChange(currentTranscript)
            onInterimTranscriptChange('')
          } else {
            // 非稳态结果
            onInterimTranscriptChange(voice_text_str)
          }
        }

        if (data.final === 1) {
          onStop?.(currentTranscript)
          ws?.close()
        }
      }
      ws.onerror = (event) => {
        console.error('WebSocket error:', event)
        onError('WebSocket connection error')
        stop()
      }
      ws.onclose = (event) => {
        console.log(
          `WebSocket connection closed: code=${event.code}, reason=${event.reason}`
        )
        _cleanup()
      }

      // 3. 初始化音频处理
      audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: audioConfig.sampleRate,
      })
      if (!audioContext) {
        throw new Error('AudioContext not supported')
      }
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // 在 await 后再次检查，防止 stop() 在此期间被调用
      if (!audioContext) {
        console.warn('AudioContext 在 getUserMedia 后被关闭，中止 start 流程。')
        // 清理可能已创建的 mediaStream
        mediaStream?.getTracks().forEach((track) => track.stop())
        mediaStream = null
        return
      }

      // 使用 AudioWorklet 替代 createScriptProcessor
      const audioWorkletProcessorUrl = '/audio-processor.js'
      try {
        await audioContext.audioWorklet.addModule(audioWorkletProcessorUrl)
      } catch (e) {
        throw new Error(
          `Failed to load audio worklet: ${e.message}. Ensure public/audio-processor.js exists.`
        )
      }

      audioWorkletNode = new AudioWorkletNode(audioContext, 'audio-processor', {
        processorOptions: {
          bufferSize: audioConfig.bufferSize,
        },
      })
      const source = audioContext.createMediaStreamSource(mediaStream)
      source.connect(audioWorkletNode)
      audioWorkletNode.connect(audioContext.destination)

      audioWorkletNode.port.onmessage = (event) => {
        if (
          !isRecording ||
          isPaused ||
          !ws ||
          ws.readyState !== WebSocket.OPEN
        ) {
          return
        }
        const { pcmData, volume } = event.data
        ws.send(pcmData.buffer)
        onAudioLevelChange(volume * 100)
      }
    } catch (error) {
      console.error('启动录音失败:', error)
      onError(error.message)
      stop()
    }
  }

  /**
   * 停止录音和识别。
   */
  function stop() {
    if (!isRecording || isStopping) return
    isStopping = true

    // 停止麦克风，但保持连接以接收最终结果
    mediaStream?.getTracks().forEach((track) => track.stop())
    if (audioWorkletNode) {
      audioWorkletNode.port.onmessage = null
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ type: 'end' }))
      } catch (e) {
        console.error('Failed to send end frame:', e)
      }
    } else {
      // 如果 ws 已经关闭，直接清理
      _cleanup()
    }
  }

  /**
   * 清理所有资源
   */
  function _cleanup() {
    mediaStream?.getTracks().forEach((track) => track.stop())
    mediaStream = null

    audioWorkletNode = cleanup(audioWorkletNode, (node) => {
      node.port.onmessage = null
      node.disconnect()
    })

    audioContext = cleanup(audioContext, 'close')
    ws = cleanup(ws, 'close')

    if (isRecording) {
      isRecording = false
      isPaused = false
      onRecordingStateChange(false)
      onAudioLevelChange(0)
    }
  }

  /**
   * 暂停录音。
   */
  function pause() {
    if (isRecording && !isPaused) {
      isPaused = true
      // 可以在这里添加 UI 状态更新的回调
    }
  }

  /**
   * 恢复录音。
   */
  function resume() {
    if (isRecording && isPaused) {
      isPaused = false
      // 可以在这里添加 UI 状态更新的回调
    }
  }

  /**
   * 获取当前的识别文本。
   * @returns {string} 当前的识别文本。
   */
  function getCurrentTranscript() {
    return currentTranscript
  }

  return { start, stop, pause, resume, getCurrentTranscript }
}
