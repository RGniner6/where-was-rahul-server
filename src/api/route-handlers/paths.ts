import { Middleware } from 'koa'
import { parseQueryObj, validateObj } from '../../utils/utils'
import Joi from 'joi'

const MIN_DATE = new Date(2020, 4, 0)
const MAX_DATE = new Date(2021, 8, 15)

const getPathsQueryParamSchema = Joi.object({
  from: Joi.date().required().greater(MIN_DATE).less(MAX_DATE),
  to: Joi.date().required().greater(Joi.ref('from')).less(MAX_DATE),
})

interface GetPaths {
  from: number
  to: number
}
export const getPaths: Middleware = async (ctx) => {
  try {
    const { from, to }: GetPaths = await getPathsQueryParamSchema.validateAsync(
      ctx.query
    )

    ctx.body = {
      from,
      to,
    }
  } catch (err) {
    console.log(err)
    ctx.throw(401, err.message, err)
  }
}
