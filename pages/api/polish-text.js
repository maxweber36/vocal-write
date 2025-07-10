/**
 * @file polish-text.js
 * @description This file contains the API route for polishing text.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { text } = req.body

  if (!text) {
    return res.status(400).json({ error: 'Text is required' })
  }

  try {
    //构建提示词
    const prompt = `
 你是一位严谨的文本优化专家。请严格按照以下要求，仅返回润色后的文本内容，不允许输出任何解释、格式说明、提示语、标签或与润色内容无关的信息。

    优化要求：
      * 纠正错别字，包括音近字、形近字、数字和标点误用，注意口语常见笔误。
      * 删除冗余词语，如重复、口头禅、多余修饰，保留表达情感或语气所需部分。
      * 优化句子结构，使成分完整、语序合理，表达自然流畅，避免生硬书面化。
      * 增强段落和句子间的自然过渡，合理使用连接词，保证逻辑清晰。
      * 保留原文意思，准确传达语气、俚语和情感色彩，避免改变原意。
      * 规范标点用法，书名、电影名等用《》，强调词语用「」，直接引语用“”。
      * 合理分段，每段围绕一个中心，避免过长或过短。

    只需输出润色后的文本，禁止输出任何与内容无关的信息。
    待润色文本如下：
    \n\n${text}
    `

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.LLM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'THUDM/GLM-4-32B-0414',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
      response_format: { type: 'text' },
      max_tokens: 4096,
      temperature: 0.3,
      enable_thinking: false,
    }

    const response = await fetch(
      'https://api.siliconflow.cn/v1/chat/completions',
      options
    )
    const data = await response.json()

    if (response.status !== 200 || !data.choices || data.choices.length === 0) {
      console.error('LLM API Error:', data)
      return res
        .status(500)
        .json({ error: 'Failed to get a valid response from LLM API' })
    }

    const polishedText = data.choices[0].message.content.trim()
    res.status(200).json({ polishedText })
  } catch (error) {
    console.error('Error calling LLM API:', error)
    res.status(500).json({ error: 'An unexpected error occurred' })
  }
}
