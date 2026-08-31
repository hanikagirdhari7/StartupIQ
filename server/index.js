import express from 'express'
import analyzeRoutes from './routes/analyze.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json({ limit: '100kb' }))
app.use('/api', analyzeRoutes)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `No route matches ${req.method} ${req.originalUrl}.`,
  })
})

app.use((err, req, res, _next) => {
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_JSON',
      message: 'Request body is not valid JSON.',
    })
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'PAYLOAD_TOO_LARGE',
      message: 'Request body is too large.',
    })
  }
  console.error('[server] Unexpected error:', err)
  res.status(500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: 'Something went wrong on our side. Please try again.',
  })
})

app.listen(PORT, () => {
  console.log(`StartupIQ API server listening on http://localhost:${PORT}`)
})
