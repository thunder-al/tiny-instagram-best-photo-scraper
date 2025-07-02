import {pino} from 'pino'
import type {PrettyOptions} from 'pino-pretty'
import {config} from './config.ts'

export const logger = pino({
  level: config.LOG_LEVEL,
  transport: {
    target: 'pino-pretty',
    options: <PrettyOptions>{
      translateTime: 'SYS:yyyy-mm-dd\'T\'HH:MM:sso',
      ignore: 'pid,hostname',
    },
  },
})

