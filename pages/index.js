import { useEffect, useState, useCallback } from 'react'
import { useAsr } from '../hooks/useAsr'
import Button from '../src/components/ui/Button'
import AudioVisualizer from '../src/components/feature/AudioVisualizer'
import Footer from '../src/components/layout/Footer'
import RecognitionResult from '../src/components/feature/RecognitionResult'

export default function Home() {
  const {
    transcript,
    interimTranscript,
    isRecording,
    audioLevel,
    error,
    toggleRecording: asrToggleRecording,
  } = useAsr()

  const [isPolishing, setIsPolishing] = useState(false)
  const [polishedTranscript, setPolishedTranscript] = useState('')

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
    } finally {
      setIsPolishing(false)
    }
  }, [])

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
            语音输入，自动润色，轻松记录每一刻
          </p>
        </div>

        <div className="w-full max-w flex flex-col items-center justify-center">
          <RecognitionResult
            transcript={transcript}
            interimTranscript={interimTranscript}
            isPolishing={isPolishing}
            polishedTranscript={polishedTranscript}
          />

          <div className="flex flex-col items-center gap-4 mt-10">
            <Button onClick={toggleRecording} isRecording={isRecording} />
            <AudioVisualizer audioLevel={audioLevel} />
            <p className="mt-1 text-sm text-gray-500">
              {isRecording ? '录音中...' : '点击开始录音'}
            </p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
              <strong>错误:</strong> {error}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
