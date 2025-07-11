/**
 * @file llm-service.js
 * @description This file contains the service for interacting with the LLM API.
 */

/**
 * Polishes the given text using the LLM API.
 * @param {string} text The text to be polished.
 * @returns {Promise<string>} The polished text.
 */
export async function polishText(text) {
  try {
    const response = await fetch('/api/polish-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to polish text')
    }

    const data = await response.json()
    return data.polishedText
  } catch (error) {
    console.error('Error polishing text:', error)
    throw error
  }
}
