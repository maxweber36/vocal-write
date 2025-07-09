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
    const handleStartRecording = () => toggleRecording()

    if (window.ipcRenderer) {
      window.ipcRenderer.on('start-recording', handleStartRecording)
    }

    return () => {
      if (window.ipcRenderer) {
        window.ipcRenderer.removeListener(
          'start-recording',
          handleStartRecording
        )
      }
    }
  }, [toggleRecording])

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gray-100 text-gray-700 p-4 sm:p-6 md:p-8">
      {/* 拖拽区域 */}
      <div
        className="fixed top-0 left-0 w-full h-20 z-50"
        style={{ WebkitAppRegion: 'drag' }}
      ></div>

      <main className="flex flex-col items-center justify-center w-full flex-1 text-center gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
            欢迎使用
            <span className="text-blue-500"> 语音输入</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500">
            点击下方的麦克风按钮，即刻将您的声音转为文字
          </p>
        </div>

        <RecognitionResult
          transcript={transcript}
          interimTranscript={interimTranscript}
          isPolishing={isPolishing}
          polishedTranscript={polishedTranscript}
        />

        <div className="flex flex-col items-center gap-4">
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
      </main>

      <Footer />
    </div>
  )
}
