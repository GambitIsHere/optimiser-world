/**
 * CORS middleware — sets appropriate headers for cross-origin requests
 */
export function cors() {
  return async (c, next) => {
    const origin = c.req.header('origin') || '*'

    // For development, allow all origins
    // For production, restrict to known frontend domains
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://optimiser.world',
      'https://www.optimiser.world',
      'https://app.optimiser.world'
    ]

    const isAllowed = origin === '*' || allowedOrigins.includes(origin)

    c.header('Access-Control-Allow-Origin', isAllowed ? origin : 'https://optimiser.world')
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-Request-ID')
    c.header('Access-Control-Max-Age', '86400')
    c.header('Access-Control-Allow-Credentials', 'true')

    if (c.req.method === 'OPTIONS') {
      return c.text('', 204)
    }

    await next()
  }
}
