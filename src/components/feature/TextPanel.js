import React from 'react'

const TextPanel = ({ title, text, setText, onCopy, placeholder, disabled }) => {
  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        <button
          onClick={onCopy}
          disabled={disabled}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          复制
        </button>
      </div>
      <div className="p-4 flex-grow">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="w-full h-full p-2 text-base text-gray-800 bg-gray-50 rounded-md resize-none border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  )
}

export default TextPanel
