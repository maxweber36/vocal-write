/**
 * @fileoverview API calls for the application.
 */

/**
 * Returns the authorization headers for API requests.
 * @returns {object} The authorization headers.
 */
function getAuthorizedHeaders() {
  // The master API key is stored in an environment variable for the client-side.
  // It's important to prefix it with NEXT_PUBLIC_ to make it available in the browser.
  const apiKey = process.env.NEXT_PUBLIC_MASTER_API_KEY
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }
}

/**
 * Fetches the signed URL for the ASR service from the backend.
 * @returns {Promise<string>} The signed URL.
 * @throws {Error} If the fetch fails or the response is not ok.
 */
export async function getSignedUrl() {
  
  const response = await fetch(`/api/generate-signature`, {
    headers: getAuthorizedHeaders(),
  })
  if (!response.ok) {
    const errData = await response.json()
    throw new Error(errData.error || '获取签名失败')
  }
  const { url } = await response.json()
  return url
}

/**
 * Sends text to the backend to be polished by an LLM.
 * @param {string} text The text to polish.
 * @returns {Promise<string>} The polished text.
 * @throws {Error} If the fetch fails or the response is not ok.
 */
export async function polishText(text) {
  const response = await fetch(`/api/polish-text`, {
    method: 'POST',
    headers: getAuthorizedHeaders(),
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    const errData = await response.json()
    throw new Error(errData.error || '文本润色失败')
  }

  const { polishedText } = await response.json()
  return polishedText
}
