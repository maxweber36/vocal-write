import { useState, useEffect, useRef, useCallback } from 'react'
import { createAsrService } from '../lib/asr-service'

// 录音时长限制：10分钟（毫秒）
export const MAX_RECORDING_DURATION = 10 * 60 * 1000

export function useAsr() {
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [error, setError] = useState(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const asrServiceRef = useRef(null)
  const recordingTimerRef = useRef(null)
  const recordingStartTimeRef = useRef(null)

  const onStopRef = useRef()

  /**
   * 开始录音时长计时器
   */
  const startRecordingTimer = useCallback(() => {
    recordingStartTimeRef.current = Date.now()
    setRecordingDuration(0)
    
    recordingTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - recordingStartTimeRef.current
      setRecordingDuration(elapsed)
      
      // 检查是否超过最大录音时长
      if (elapsed >= MAX_RECORDING_DURATION) {
        console.log('录音时长已达到10分钟上限，自动停止录音')
        asrServiceRef.current?.stop()
        setError('录音时长已达到10分钟上限，已自动停止')
      }
    }, 100) // 每100ms更新一次时长显示
  }, [])

  /**
   * 停止录音时长计时器
   */
  const stopRecordingTimer = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    recordingStartTimeRef.current = null
  }, [])

  useEffect(() => {
    asrServiceRef.current = createAsrService({
      onTranscriptChange: setTranscript,
      onInterimTranscriptChange: setInterimTranscript,
      onRecordingStateChange: (recording) => {
        setIsRecording(recording)
        if (recording) {
          startRecordingTimer()
        } else {
          stopRecordingTimer()
        }
      },
      onAudioLevelChange: setAudioLevel,
      onError: (err) => {
        setError(err.message || err)
        console.error('ASR Service Error:', err)
        stopRecordingTimer()
      },
      onStop: (finalTranscript) => {
        stopRecordingTimer()
        onStopRef.current?.(finalTranscript)
      },
    })

    return () => {
      asrServiceRef.current?.stop()
      stopRecordingTimer()
    }
  }, [startRecordingTimer, stopRecordingTimer])

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
    recordingDuration,
    toggleRecording,
  }
}
