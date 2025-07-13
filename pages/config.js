import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import LoadingSpinner from '../src/components/ui/LoadingSpinner'

/**
 * 配置页面组件
 * 允许用户配置API密钥信息
 */
export default function Config() {
  const router = useRouter()
  const [config, setConfig] = useState({
    TENCENT_APP_ID: '',
    TENCENT_SECRET_ID: '',
    TENCENT_SECRET_KEY: '',
    LLM_API_KEY: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'

  /**
   * 显示消息提示
   */
  const showMessage = useCallback((msg, type) => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 3000)
  }, [])

  /**
   * 从主进程加载配置信息
   */
  const loadConfig = useCallback(async () => {
    try {
      if (window.electron) {
        const data = await window.electron.invoke('get-config')
        setConfig(data)
      } else {
        console.warn('Electron API not available, running in browser mode.')
        // Fallback for browser development if needed
        const response = await fetch('/api/config')
        if (response.ok) {
          const data = await response.json()
          setConfig(data)
        }
      }
    } catch (error) {
      console.error('加载配置失败:', error)
      showMessage('加载配置失败', 'error')
    } finally {
      setLoading(false)
    }
  }, [showMessage])

  /**
   * 加载当前配置
   */
  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  /**
   * 处理输入框变化
   */
  const handleInputChange = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  /**
   * 保存配置
   */
  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      if (window.electron) {
        const result = await window.electron.invoke('save-config', config)
        if (result.success) {
          showMessage('配置保存成功！', 'success')
        } else {
          showMessage(result.error || '保存失败', 'error')
        }
      } else {
        console.warn('Electron API not available, running in browser mode.')
        // Fallback for browser development if needed
        const response = await fetch('/api/config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(config),
        })
        if (response.ok) {
          showMessage('配置保存成功！', 'success')
        } else {
          const error = await response.json()
          showMessage(error.message || '保存失败', 'error')
        }
      }
    } catch (error) {
      console.error('保存配置失败:', error)
      showMessage('保存配置失败', 'error')
    } finally {
      setSaving(false)
    }
  }, [config, showMessage])

  /**
   * 显示消息提示
   */

  /**
   * 返回主页
   */
  const handleBack = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* 拖拽区域 */}
      <div
        className="fixed top-0 left-0 w-full h-25 z-50"
        style={{ WebkitAppRegion: 'drag' }}
      ></div>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">API 配置</h1>
          <button
            onClick={handleBack}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            style={{ WebkitAppRegion: 'no-drag' }}
          >
            ← 返回主页
          </button>
        </div>

        {/* 消息提示 */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-md ${
              messageType === 'success'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}
          >
            {message}
          </div>
        )}

        {/* 配置表单 */}
        <div className="space-y-6">
          {/* 腾讯云配置 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              腾讯云语音识别配置
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  应用 ID (TENCENT_APP_ID)
                </label>
                <input
                  type="text"
                  value={config.TENCENT_APP_ID}
                  onChange={(e) =>
                    handleInputChange('TENCENT_APP_ID', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入腾讯云应用ID"
                  style={{ WebkitAppRegion: 'no-drag' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密钥 ID (TENCENT_SECRET_ID)
                </label>
                <input
                  type="text"
                  value={config.TENCENT_SECRET_ID}
                  onChange={(e) =>
                    handleInputChange('TENCENT_SECRET_ID', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入腾讯云密钥ID"
                  style={{ WebkitAppRegion: 'no-drag' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密钥 (TENCENT_SECRET_KEY)
                </label>
                <input
                  type="password"
                  value={config.TENCENT_SECRET_KEY}
                  onChange={(e) =>
                    handleInputChange('TENCENT_SECRET_KEY', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入腾讯云密钥"
                  style={{ WebkitAppRegion: 'no-drag' }}
                />
              </div>
            </div>
          </div>

          {/* LLM配置 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              大模型配置
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API 密钥 (LLM_API_KEY)
              </label>
              <input
                type="password"
                value={config.LLM_API_KEY}
                onChange={(e) =>
                  handleInputChange('LLM_API_KEY', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入大模型API密钥"
                style={{ WebkitAppRegion: 'no-drag' }}
              />
            </div>
          </div>

          {/* 保存按钮 */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ WebkitAppRegion: 'no-drag' }}
            >
              {saving ? (
                <div className="flex items-center">
                  <LoadingSpinner />
                  <span className="ml-2">保存中...</span>
                </div>
              ) : (
                '保存配置'
              )}
            </button>
          </div>
        </div>

        {/* 说明信息 */}
        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">配置说明：</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 腾讯云配置用于语音识别服务</li>
            <li>
              • LLM API密钥(
              <a
                href="https://cloud.siliconflow.cn/i/FIKFUSng"
                target="_blank"
                rel="noopener noreferrer"
                class="underline hover:text-blue-500"
              >
                获取硅基流动API
              </a>
              )用于文本润色功能
            </li>
            <li>• 所有配置信息仅存储在本地，确保数据安全</li>
            <li>• 修改配置后需要重启应用才能生效</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
