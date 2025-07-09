import { useState, useEffect, useRef, useCallback } from 'react'
import { createAsrService } from '../lib/asr-service'

export function useAsr() {
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [error, setError] = useState(null)
  const asrServiceRef = useRef(null)

  const onStopRef = useRef()

  useEffect(() => {
    asrServiceRef.current = createAsrService({
      onTranscriptChange: setTranscript,
      onInterimTranscriptChange: setInterimTranscript,
      onRecordingStateChange: setIsRecording,
      onAudioLevelChange: setAudioLevel,
      onError: (err) => {
        setError(err.message || err)
        console.error('ASR Service Error:', err)
      },
      onStop: (finalTranscript) => {
        onStopRef.current?.(finalTranscript)
      },
    })

    return () => {
      asrServiceRef.current?.stop()
    }
  }, [])

  const toggleRecording = useCallback(
    (onStop) => {
      onStopRef.current = onStop
      if (isRecording) {
        asrServiceRef.current?.stop()
      } else {
        setError(null)
        setTranscript('')
        setInterimTranscript('')
        asrServiceRef.current?.start()
      }
    },
    [isRecording]
  )

  return {
    transcript,
    interimTranscript,
    isRecording,
    audioLevel,
    error,
    toggleRecording,
  }
}
