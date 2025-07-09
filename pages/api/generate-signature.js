import crypto from 'crypto'

export default function handler(req, res) {
  try {
    //请求方法检查
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    //获取腾讯云密钥
    const { appId, SecretId, secretKey } = {
      appId: process.env.TENCENT_APP_ID,
      SecretId: process.env.TENCENT_SECRET_ID,
      secretKey: process.env.TENCENT_SECRET_KEY,
    }

    if (!appId || !SecretId || !secretKey) {
      return res
        .status(500)
        .json({ error: '缺少腾讯云密钥配置，请检查 .env.local 文件。' })
    }

    // 参数准备
    const host = 'asr.cloud.tencent.com'
    const path = `/asr/v2/${appId}`
    const timestamp = Math.floor(Date.now() / 1000)

    const params = {
      SecretId: SecretId,
      timestamp: timestamp,
      nonce: Math.floor(Math.random() * 100000),
      expired: timestamp + 24 * 3600,
      engine_model_type: '16k_zh',
      voice_id: `vocal-write-${Date.now()}`,
      voice_format: 1,
    }

    //签名生成
    const sortedKeys = Object.keys(params).sort()

    const queryStringForSign = sortedKeys
      .map((key) => `${key}=${params[key]}`)
      .join('&')
    const signStr = `${host}${path}?${queryStringForSign}`
    // console.log("签名原文串 (signStr):", signStr); //打印调试
    const signature = crypto
      .createHmac('sha1', secretKey)
      .update(signStr)
      .digest('base64')

    //最终 URL 构建
    const queryStringForUrl = sortedKeys
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
      .join('&')
    const finalUrl = `wss://${host}${path}?${queryStringForUrl}&signature=${encodeURIComponent(
      signature
    )}`

    res.status(200).json({ url: finalUrl })
  } catch (error) {
    console.error('签名生成失败:', error)
    res.status(500).json({ error: '签名生成失败' })
  }
}
