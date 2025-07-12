import LoadingSpinner from '../ui/LoadingSpinner'

const RecognitionResult = ({
  transcript,
  interimTranscript,
  isPolishing,
  polishedTranscript,
  onPolishedTranscriptChange,
}) => {
  const showEditableTextarea = !isPolishing && polishedTranscript !== ''

  return (
    <div className="w-full max-w-3xl p-6 bg-white rounded-2xl shadow-lg h-[300px] text-left text-sm leading-relaxed border border-gray-200 overflow-y-auto pb-12">
      {isPolishing ? (
        <div className="h-full flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : showEditableTextarea ? (
        <textarea
          className="w-full h-full bg-transparent focus:outline-none resize-none"
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
