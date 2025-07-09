import React from 'react'

const ResultFooter = ({ originalTextLength, polishedTextLength }) => {
  return (
    <div className="w-full flex justify-center items-center mt-6 text-sm text-gray-500">
      <div className="flex gap-6 bg-gray-100 px-4 py-2 rounded-full">
        <span>原始字数: {originalTextLength}</span>
        <span>润色字数: {polishedTextLength}</span>
      </div>
    </div>
  )
}

export default ResultFooter
