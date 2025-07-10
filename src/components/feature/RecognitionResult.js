import React from 'react'
import LoadingSpinner from '../ui/LoadingSpinner'

const RecognitionResult = ({
  transcript,
  interimTranscript,
  isPolishing,
  polishedTranscript,
}) => {
  const displayText = polishedTranscript || transcript

  return (
    <div className="w-full max-w-3xl p-6 bg-white rounded-2xl shadow-lg h-[300px] text-left text-sm leading-relaxed whitespace-pre-wrap border border-gray-200 overflow-y-auto">
      {isPolishing ? (
        <div className="h-full flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="w-full">
          {!displayText && !interimTranscript ? (
            <div className="h-full flex items-center justify-center">
              <span className="text-gray-400">识别结果将显示在这里...</span>
            </div>
          ) : (
            <div>
              {displayText && <span className="text-gray-500">{displayText}</span>}
              <span className="text-gray-400">{interimTranscript}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RecognitionResult
