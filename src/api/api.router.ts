import Router from 'koa-router'
import Koa from 'koa'
import serve from 'koa-static'
import send from 'koa-send'
import { API_PREFIX } from '../server'
import { getPaths } from './route-handlers/paths'

export function setupRouter(app: Koa) {
  const router = new Router({ prefix: API_PREFIX })

  router.get('/paths', getPaths)

  router.all('/ping', (ctx) => {
    const requestBody = ctx.request.body || {}
    console.log(ctx.request.body)
    ctx.body = {
      status: 'Successfully received request',
      requestBody,
    }
  })

  app.use(router.routes())
  app.use(router.allowedMethods())
}
