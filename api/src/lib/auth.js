/**
 * Authentication middleware
 * Supports both API keys (X-API-Key header) and session tokens (Bearer token)
 */

/**
 * Hash API key using SHA-256
 */
async function hashKey(key) {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Middleware that requires authentication
 * Checks X-API-Key header or Authorization Bearer token
 */
export function requireAuth() {
  return async (c, next) => {
    const apiKey = c.req.header('X-API-Key')
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')

    if (apiKey) {
      try {
        const keyHash = await hashKey(apiKey)
        const result = await c.env.DB.prepare(
          `SELECT ak.id as key_id, ak.user_id, u.id, u.username, u.karma, u.display_name
           FROM api_keys ak
           JOIN users u ON ak.user_id = u.id
           WHERE ak.key_hash = ? AND ak.revoked_at IS NULL
           LIMIT 1`
        ).bind(keyHash).first()

        if (!result) {
          return c.json({ error: 'Invalid API key' }, 401)
        }

        // Update last_used_at asynchronously (don't await)
        c.env.DB.prepare('UPDATE api_keys SET last_used_at = datetime("now") WHERE id = ?')
          .bind(result.key_id)
          .run()
          .catch(e => console.error('Failed to update api_key last_used_at:', e))

        c.set('user', {
          id: result.id,
          username: result.username,
          karma: result.karma,
          display_name: result.display_name,
          auth_method: 'api_key'
        })

        return next()
      } catch (e) {
        console.error('API key auth error:', e)
        return c.json({ error: 'Authentication failed' }, 401)
      }
    }

    if (sessionToken) {
      // TODO: Implement session token verification via Better Auth or similar
      // For now, sessions are not implemented
      return c.json({ error: 'Session auth not yet implemented' }, 501)
    }

    return c.json({ error: 'Authentication required' }, 401)
  }
}

/**
 * Optional authentication middleware
 * Sets user if present, continues regardless
 */
export function optionalAuth() {
  return async (c, next) => {
    const apiKey = c.req.header('X-API-Key')

    if (apiKey) {
      try {
        const keyHash = await hashKey(apiKey)
        const result = await c.env.DB.prepare(
          `SELECT ak.id as key_id, ak.user_id, u.id, u.username, u.karma, u.display_name
           FROM api_keys ak
           JOIN users u ON ak.user_id = u.id
           WHERE ak.key_hash = ? AND ak.revoked_at IS NULL
           LIMIT 1`
        ).bind(keyHash).first()

        if (result) {
          // Update last_used_at asynchronously
          c.env.DB.prepare('UPDATE api_keys SET last_used_at = datetime("now") WHERE id = ?')
            .bind(result.key_id)
            .run()
            .catch(e => console.error('Failed to update api_key last_used_at:', e))

          c.set('user', {
            id: result.id,
            username: result.username,
            karma: result.karma,
            display_name: result.display_name,
            auth_method: 'api_key'
          })
        }
      } catch (e) {
        console.error('Optional auth error:', e)
        // Continue without auth
      }
    }

    return next()
  }
}

/**
 * Get authenticated user from context, or undefined
 */
export function getUser(c) {
  try {
    return c.get('user')
  } catch {
    return undefined
  }
}
