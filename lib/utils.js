/**
 * @fileoverview Utility functions for the application.
 */

/**
 * Safely closes and releases a resource.
 * @param {any} resource - The resource to clean up.
 * @param {string|Function} closeMethod - The name of the close method or a custom cleanup function.
 * @returns {null} Always returns null.
 */
export function cleanup(resource, closeMethod) {
  if (resource) {
    try {
      if (typeof closeMethod === 'function') {
        closeMethod(resource)
      } else if (resource[closeMethod]) {
        resource[closeMethod]()
      }
    } catch (e) {
      console.error(`清理资源失败:`, e)
    }
  }
  return null
}
