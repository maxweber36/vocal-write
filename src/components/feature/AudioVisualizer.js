import React from 'react'

const AudioVisualizer = ({ audioLevel }) => {
  return (
    <div className="w-56 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-400 transition-all duration-100"
        style={{ width: `${audioLevel}%` }}
      ></div>
    </div>
  )
}

export default AudioVisualizer
