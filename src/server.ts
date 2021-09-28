import Koa from 'koa'
import { setupGlobalMiddleware } from './middleware/global-middleware'
import dotEnv from 'dotenv'

dotEnv.config()

export const SRC_ROOT_PATH = __dirname
export const API_PREFIX = '/api'

const PORT = 8000

const app = new Koa()
setupGlobalMiddleware(app)
app.listen(PORT, () => console.log(`listening on port ${PORT}`))
