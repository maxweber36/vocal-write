import React from 'react'

const Footer = () => {
  return (
    <footer className="w-full text-center py-4 text-gray-400 text-xs">
      {/* text-gray-500 用于设置字体颜色为灰色，text-sm 用于设置字体大小为小号 */}
      created by <a href="https://maxweber36.github.io/archives/" className="text-blue-500 hover:text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">阿犇Weber</a>
    </footer>
  )
}

export default Footer
