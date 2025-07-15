import React from 'react'

/**
 * 录音进度条组件
 * @param {Object} props - 组件属性
 * @param {number} props.recordingDuration - 当前录音时长（毫秒）
 * @param {number} props.maxDuration - 最大录音时长（毫秒）
 * @param {Function} props.formatDuration - 格式化时长的函数
 * @returns {JSX.Element} 录音进度条组件
 */
const RecordingProgressBar = ({
  recordingDuration,
  maxDuration,
  formatDuration,
}) => {
  return (
    <div className="flex flex-col items-center gap-2 w-80">
      {/* 进度条容器 - 时间显示在两侧 */}
      <div className="flex items-center gap-3 w-full">
        {/* 左侧时间显示 */}
        <span className="text-gray-600 font-mono text-xs min-w-[2.5rem]">
          {formatDuration(recordingDuration)}
        </span>

        {/* 中间进度条 */}
        <div className="flex-1 bg-gray-200 rounded-full h-2 relative overflow-hidden">
          {/* 进度条背景 */}
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-rose-400 rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${Math.min((recordingDuration / maxDuration) * 100, 100)}%`,
            }}
          ></div>
          {/* 闪烁指示器 */}
          <div
            className="absolute top-0 w-1 h-full bg-white shadow-lg animate-pulse"
            style={{
              left: `${Math.min((recordingDuration / maxDuration) * 100, 100)}%`,
              transform: 'translateX(-50%)',
            }}
          ></div>
        </div>

        {/* 右侧时间显示 */}
        <span className="text-gray-400 font-mono text-xs min-w-[2.5rem]">
          {formatDuration(maxDuration)}
        </span>
      </div>
    </div>
  )
}

export default RecordingProgressBar
