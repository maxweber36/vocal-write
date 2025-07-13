import fs from 'fs'
import path from 'path'

/**
 * 配置文件路径
 */
const CONFIG_FILE_PATH = path.join(process.cwd(), '.env.local')

/**
 * 配置API处理器
 * 支持GET和POST方法来读取和保存配置
 */
export default function handler(req, res) {
  if (req.method === 'GET') {
    return handleGetConfig(req, res)
  } else if (req.method === 'POST') {
    return handleSaveConfig(req, res)
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
}

/**
 * 处理获取配置请求
 */
function handleGetConfig(req, res) {
  try {
    const config = readConfig()
    return res.status(200).json(config)
  } catch (error) {
    console.error('读取配置失败:', error)
    return res.status(500).json({ message: '读取配置失败' })
  }
}

/**
 * 处理保存配置请求
 */
function handleSaveConfig(req, res) {
  try {
    const {
      TENCENT_APP_ID,
      TENCENT_SECRET_ID,
      TENCENT_SECRET_KEY,
      LLM_API_KEY,
    } = req.body

    // 验证必填字段
    if (
      !TENCENT_APP_ID ||
      !TENCENT_SECRET_ID ||
      !TENCENT_SECRET_KEY ||
      !LLM_API_KEY
    ) {
      return res.status(400).json({ message: '所有配置项都是必填的' })
    }

    // 保存配置
    const config = {
      TENCENT_APP_ID,
      TENCENT_SECRET_ID,
      TENCENT_SECRET_KEY,
      LLM_API_KEY,
    }

    saveConfig(config)
    return res.status(200).json({ message: '配置保存成功' })
  } catch (error) {
    console.error('保存配置失败:', error)
    return res.status(500).json({ message: '保存配置失败' })
  }
}

/**
 * 读取配置文件
 * @returns {Object} 配置对象
 */
function readConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE_PATH)) {
      // 如果配置文件不存在，返回空配置
      return {
        TENCENT_APP_ID: '',
        TENCENT_SECRET_ID: '',
        TENCENT_SECRET_KEY: '',
        LLM_API_KEY: '',
      }
    }

    const content = fs.readFileSync(CONFIG_FILE_PATH, 'utf8')
    const config = parseEnvContent(content)

    return {
      TENCENT_APP_ID: config.TENCENT_APP_ID || '',
      TENCENT_SECRET_ID: config.TENCENT_SECRET_ID || '',
      TENCENT_SECRET_KEY: config.TENCENT_SECRET_KEY || '',
      LLM_API_KEY: config.LLM_API_KEY || '',
    }
  } catch (error) {
    console.error('读取配置文件失败:', error)
    throw error
  }
}

/**
 * 保存配置到文件
 * @param {Object} config - 配置对象
 */
function saveConfig(config) {
  try {
    // 读取现有配置
    let existingConfig = {}
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const content = fs.readFileSync(CONFIG_FILE_PATH, 'utf8')
      existingConfig = parseEnvContent(content)
    }

    // 合并配置
    const mergedConfig = {
      ...existingConfig,
      ...config,
    }

    // 生成新的配置文件内容
    const envContent = generateEnvContent(mergedConfig)

    // 写入文件
    fs.writeFileSync(CONFIG_FILE_PATH, envContent, 'utf8')
  } catch (error) {
    console.error('保存配置文件失败:', error)
    throw error
  }
}

/**
 * 解析.env文件内容
 * @param {string} content - 文件内容
 * @returns {Object} 解析后的配置对象
 */
function parseEnvContent(content) {
  const config = {}
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const equalIndex = trimmedLine.indexOf('=')
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim()
        let value = trimmedLine.substring(equalIndex + 1).trim()

        // 移除引号
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1)
        }

        config[key] = value
      }
    }
  }

  return config
}

/**
 * 生成.env文件内容
 * @param {Object} config - 配置对象
 * @returns {string} 生成的文件内容
 */
function generateEnvContent(config) {
  const lines = []

  // 按照特定顺序排列配置项
  const orderedKeys = [
    'TENCENT_APP_ID',
    'TENCENT_SECRET_ID',
    'TENCENT_SECRET_KEY',
    'LLM_API_KEY',
  ]

  // 添加有序的配置项
  for (const key of orderedKeys) {
    if (config[key] !== undefined) {
      lines.push(`${key}=${config[key]}`)
    }
  }

  // 添加其他配置项
  for (const [key, value] of Object.entries(config)) {
    if (!orderedKeys.includes(key)) {
      if (
        typeof value === 'string' &&
        (value.includes(' ') || value.includes('/'))
      ) {
        lines.push(`${key}="${value}"`)
      } else {
        lines.push(`${key}=${value}`)
      }
    }
  }

  return lines.join('\n') + '\n'
}
