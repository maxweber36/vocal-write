import React from 'react'

const Button = ({ onClick, isRecording }) => {
  return (
    <button
      onClick={onClick}
      style={{ WebkitAppRegion: 'no-drag' }}
      className={`relative w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
        isRecording
          ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400'
          : 'bg-sky-500 hover:bg-sky-600 focus:ring-sky-400'
      }`}
    >
      <svg
        className="w-5 h-5 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        ></path>
      </svg>
      {isRecording && (
        <div
          className="absolute top-0 left-0 w-full h-full rounded-full bg-red-500 opacity-75 animate-ping"
          style={{ animationDuration: '1.5s' }}
        ></div>
      )}
    </button>
  )
}

export default Button
