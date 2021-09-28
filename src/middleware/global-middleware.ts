import Koa from 'koa'
import logger from 'koa-logger'
import body from 'koa-body'
import cors from 'koa2-cors'
import { setupRouter } from '../api/api.router'

export function setupGlobalMiddleware(app: Koa) {
  app.use(logger())
  app.use(body())
  // used to enable CORS
  app.use(cors({ origin: '*' }))
  setupRouter(app)
}
