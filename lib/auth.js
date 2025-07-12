/**
 * @fileoverview API Key authentication middleware.
 */

/**
 * A higher-order function to wrap an API handler with API key authentication.
 * It checks for a 'Authorization' header and validates the key against
 * the MASTER_API_KEY environment variable.
 *
 * @param {function(object, object): void} handler The original Next.js API handler.
 * @returns {function(object, object): Promise<void>} The wrapped handler with authentication.
 */
export function withApiKey(handler) {
  return async (req, res) => {
    const masterKey = process.env.MASTER_API_KEY;
    if (!masterKey) {
      console.error('MASTER_API_KEY is not set in the environment variables.');
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }

    const userKey = authHeader.split(' ')[1];
    if (userKey !== masterKey) {
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }

    return handler(req, res);
  };
}