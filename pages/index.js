import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import copyIcon from '../src/assets/icon-copy.png'

import { useAsr, MAX_RECORDING_DURATION } from '../hooks/useAsr'
import Button from '../src/components/ui/Button'
import AudioVisualizer from '../src/components/feature/AudioVisualizer'
import Footer from '../src/components/layout/Footer'
import RecognitionResult from '../src/components/feature/RecognitionResult'
import LoadingSpinner from '../src/components/ui/LoadingSpinner'

export default function Home() {
  const {
    transcript,
    interimTranscript,
    isRecording,
    audioLevel,
    error,
    recordingDuration,
    toggleRecording: asrToggleRecording,
  } = useAsr()

  const [isPolishing, setIsPolishing] = useState(false)
  const [polishedTranscript, setPolishedTranscript] = useState('')
  const [showCopySuccess, setShowCopySuccess] = useState(false)

  /**
   * 格式化录音时长为 mm:ss 格式
   * @param {number} duration - 录音时长（毫秒）
   * @returns {string} 格式化后的时间字符串
   */
  const formatDuration = useCallback((duration) => {
    const totalSeconds = Math.floor(duration / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [])

  /**
   * Handles the polishing of the given text.
   * @param {string} text - The text to be polished.
   */
  const handlePolishText = useCallback(async (text) => {
    if (!text) return

    setIsPolishing(true)
    try {
      const response = await fetch('/api/polish-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('Failed to polish text.')
      }

      const data = await response.json()
      setPolishedTranscript(data.polishedText)
    } catch (error) {
      alert(error.message)
      // 润色失败时，将被原始文本设置为可编辑
      setPolishedTranscript(text)
    } finally {
      setIsPolishing(false)
    }
  }, [])

  const handleCopy = useCallback(() => {
    const textToCopy = polishedTranscript
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(
        () => {
          setShowCopySuccess(true)
        },
        (err) => {
          console.error('Could not copy text: ', err)
        }
      )
    }
  }, [polishedTranscript])

  useEffect(() => {
    if (showCopySuccess) {
      const timer = setTimeout(() => {
        setShowCopySuccess(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showCopySuccess])

  /**
   * Toggles the recording state and handles text polishing.
   */
  useEffect(() => {
    if (window.ipcRenderer) {
      window.ipcRenderer.send('recording-state-changed', isRecording)
    }
  }, [isRecording])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      asrToggleRecording((finalTranscript) => {
        handlePolishText(finalTranscript)
      })
    } else {
      setPolishedTranscript('')
      asrToggleRecording()
    }
  }, [isRecording, asrToggleRecording, handlePolishText])

  const handlePolishedTranscriptChange = useCallback((e) => {
    setPolishedTranscript(e.target.value)
  }, [])

  useEffect(() => {
    const handleToggleRecording = () => {
      toggleRecording()
    }

    if (window.ipcRenderer) {
      const unsubscribe = window.ipcRenderer.on(
        'toggle-recording',
        handleToggleRecording
      )
      return unsubscribe // 在组件卸载时清理监听器
    }
  }, [toggleRecording])

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gray-100 text-gray-700 p-4 sm:p-6 md:p-8">
      {/* 拖拽区域 */}
      <div
        className="fixed top-0 left-0 w-full h-25 z-50"
        style={{ WebkitAppRegion: 'drag' }}
      ></div>

      <main className="flex flex-col w-full flex-1 items-center">
        <div className="flex flex-col p-4 max-w-3xl w-full ">
          <h1 className="text-1xl sm:text-3xl font-bold text-blue-500">
            快记说
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-3">
            语音一说即录，文字一键即贴
          </p>
        </div>

        <div className="w-full max-w flex flex-col items-center justify-center">
          <div className="w-full relative">
            {' '}
            {/* 添加 relative */}
            <RecognitionResult
              transcript={transcript}
              interimTranscript={interimTranscript}
              isPolishing={isPolishing}
              polishedTranscript={polishedTranscript}
              onPolishedTranscriptChange={handlePolishedTranscriptChange}
            />
            <div>
              {!isRecording && !isPolishing && polishedTranscript && (
                <button
                  onClick={handleCopy}
                  className="absolute bottom-2 right-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none"
                >
                  <Image src={copyIcon} alt="Copy icon" width={20} height={20} />
                </button>
              )}
            </div>
          </div>

          {showCopySuccess && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 bg-opacity-70 text-white px-4 py-2 rounded-md">
              复制成功
            </div>
          )}

          <div className="flex flex-col items-center gap-4 mt-10">
            <Button onClick={toggleRecording} isRecording={isRecording} />

            {/* 录音状态和时长显示 */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-gray-500">
                {isRecording ? '录音中' : '点击开始录音'}
              </p>
              {isRecording && (
                <div className="flex flex-col items-center gap-2 w-80">
                  {/* 进度条容器 - 时间显示在两侧 */}
                  <div className="flex items-center gap-3 w-full">
                    {/* 左侧时间显示 */}
                    <span className="text-gray-600 font-mono text-xs min-w-[2.5rem]">
                      {formatDuration(recordingDuration)}
                    </span>

                    {/* 中间进度条 */}
                    <div className="flex-1 bg-gray-200 rounded-full h-2 relative overflow-hidden">
                      {/* 进度条背景 */}
                      <div
                        className="h-full bg-gradient-to-r from-sky-400 to-rose-400 rounded-full transition-all duration-300 ease-out"
                        style={{
                          width: `${Math.min((recordingDuration / MAX_RECORDING_DURATION) * 100, 100)}%`,
                        }}
                      ></div>
                      {/* 闪烁指示器 */}
                      <div
                        className="absolute top-0 w-1 h-full bg-white shadow-lg animate-pulse"
                        style={{
                          left: `${Math.min((recordingDuration / MAX_RECORDING_DURATION) * 100, 100)}%`,
                          transform: 'translateX(-50%)',
                        }}
                      ></div>
                    </div>

                    {/* 右侧时间显示 */}
                    <span className="text-gray-400 font-mono text-xs min-w-[2.5rem]">
                      10:00
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-500 rounded-lg">
              <strong>错误:</strong> {error}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
