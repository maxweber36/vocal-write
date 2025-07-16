import { useRef, useEffect, useState } from 'react'
import LoadingSpinner from '../ui/LoadingSpinner'

const RecognitionResult = ({
  transcript,
  interimTranscript,
  isPolishing,
  polishedTranscript,
  onPolishedTranscriptChange,
}) => {
  const showEditableTextarea = !isPolishing && polishedTranscript !== ''
  const scrollRef = useRef(null)
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true)

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (scrollElement && isScrolledToBottom) {
      scrollElement.scrollTop = scrollElement.scrollHeight
    }
  }, [transcript, interimTranscript, polishedTranscript, isScrolledToBottom])

  const handleScroll = () => {
    const scrollElement = scrollRef.current
    if (scrollElement) {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      const atBottom = scrollHeight - scrollTop <= clientHeight + 1 // 加 1 像素容差
      setIsScrolledToBottom(atBottom)
    }
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="w-full max-w-3xl p-6 bg-white rounded-2xl shadow-lg h-[300px] text-left text-sm leading-relaxed border border-gray-200 overflow-y-auto pb-12"
    >
      {isPolishing ? (
        <div className="h-full flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : showEditableTextarea ? (
        <textarea
          className="w-full h-full bg-transparent focus:outline-none resize-none text-sky-500"
          value={polishedTranscript}
          onChange={onPolishedTranscriptChange}
        />
      ) : (
        <div className="w-full">
          {transcript.final === '' && interimTranscript === '' ? (
            <div className="h-full flex items-center justify-center">
              <span className="text-gray-400">识别结果将显示在这里...</span>
            </div>
          ) : (
            <div>
              <span className="text-gray-500">{transcript.final}</span>
              <span className="text-gray-400">{interimTranscript}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RecognitionResult
