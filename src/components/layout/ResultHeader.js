import React from 'react'

const ResultHeader = ({ copied }) => {
  return (
    <div className="relative flex justify-center items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-800">转录结果</h1>
      {copied && (
        <div className="absolute right-0 px-3 py-1 text-sm text-white bg-green-500 rounded-full animate-bounce">
          已复制到剪贴板
        </div>
      )}
    </div>
  )
}

export default ResultHeader
