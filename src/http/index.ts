import {fastify} from 'fastify'
import {logger} from '../logger.ts'
import {scraperController} from './scraper-controller.ts'

export const httpLogger = logger.child({name: 'http'})

export const http = fastify({
  loggerInstance: httpLogger,
  disableRequestLogging: true,
  return503OnClosing: true,
})

http.register(scraperController)

http.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode ?? 500

  if (statusCode >= 500) {
    httpLogger.error(
      {
        id: request.id,
        params: request.params,
        query: request.query,
        body: request.body,
      },
      error ? error.message : 'Error',
    )

    httpLogger.error(error.stack)

    const message = 'Internal Server Error'
    reply.status(statusCode).send({message})
    return
  }

  reply.status(statusCode).send({...error})
})

