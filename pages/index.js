import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import copyIcon from '../src/assets/icon-copy.png'
import polishIcon from '../src/assets/icon-polish-text.png'

import { useAsr, MAX_RECORDING_DURATION } from '../hooks/useAsr'
import Button from '../src/components/ui/Button'
import Footer from '../src/components/layout/Footer'
import RecognitionResult from '../src/components/feature/RecognitionResult'

export default function Home() {
  const router = useRouter()
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

  /**
   * 跳转到配置页面
   */
  const handleGoToConfig = useCallback(() => {
    router.push('/config')
  }, [router])

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
      {/* <div
        className="fixed top-0 left-0 w-full h-25 z-50"
        style={{ WebkitAppRegion: 'drag' }}
      ></div> */}

      <main className="flex flex-col w-full flex-1 items-center">
        <div className="flex flex-col p-4 max-w-3xl w-full ">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-1xl sm:text-3xl font-bold text-blue-500">
                声笔
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-3">
                语音一说即录，文字一键即贴
              </p>
            </div>
            <button
              onClick={handleGoToConfig}
              className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              style={{ WebkitAppRegion: 'no-drag' }}
              title="API配置"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            </button>
          </div>
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
                  <Image
                    src={copyIcon}
                    alt="Copy icon"
                    width={20}
                    height={20}
                  />
                </button>
              )}
              {!isRecording && polishedTranscript && (
                <button
                  onClick={() => handlePolishText(polishedTranscript)}
                  className="absolute bottom-2 right-10 p-2 rounded-md hover:bg-gray-100 focus:outline-none"
                  disabled={isPolishing}
                >
                  <Image
                    src={polishIcon}
                    alt="Polish icon"
                    width={20}
                    height={20}
                  />
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
