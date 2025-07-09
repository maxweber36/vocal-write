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
    <div className="w-full max-w-3xl p-6 bg-white rounded-2xl shadow-lg min-h-[250px] text-left text-sm leading-relaxed whitespace-pre-wrap border border-gray-200 flex items-center justify-center">
      {isPolishing ? (
        <LoadingSpinner />
      ) : (
        <div className="w-full h-full">
          {!displayText && !interimTranscript && (
            <span className="text-gray-400">识别结果将显示在这里...</span>
          )}
          {displayText && <span>{displayText}</span>}
          <span className="text-gray-400">{interimTranscript}</span>
        </div>
      )}
    </div>
  )
}

export default RecognitionResult
