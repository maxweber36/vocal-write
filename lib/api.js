/**
 * @fileoverview API calls for the application.
 */

/**
 * Fetches the signed URL for the ASR service from the backend.
 * @returns {Promise<string>} The signed URL.
 * @throws {Error} If the fetch fails or the response is not ok.
 */
export async function getSignedUrl() {
  const response = await fetch('/api/generate-signature')
  if (!response.ok) {
    const errData = await response.json()
    throw new Error(errData.error || '获取签名失败')
  }
  const { url } = await response.json()
  return url
}
