import { Hono } from 'hono'
import { cors } from './middleware/cors.js'
import searchRoutes from './routes/search.js'
import itemRoutes from './routes/items.js'
import feedRoutes from './routes/feed.js'
import userRoutes from './routes/user.js'
import submitRoutes from './routes/submit.js'
import reportRoutes from './routes/report.js'

const app = new Hono()

// Global middleware
app.use('*', cors())

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'development'
  })
})

// Mount route modules
app.route('/api', searchRoutes)
app.route('/api', itemRoutes)
app.route('/api', feedRoutes)
app.route('/api', userRoutes)
app.route('/api', submitRoutes)
app.route('/api', reportRoutes)

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not found',
    path: c.req.path,
    method: c.req.method
  }, 404)
})

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method
  })

  return c.json({
    error: 'Internal server error',
    details: c.env.ENVIRONMENT === 'development' ? err.message : undefined
  }, 500)
})

export default app
