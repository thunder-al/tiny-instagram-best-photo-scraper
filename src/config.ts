import {z} from 'zod'

const validator = z.object({
  /**
   * Log level for the application.
   */
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).default('info'),
  /**
   * Base url to OpenAI like API
   */
  AI_API_URL: z.string().url(),
  /**
   * API key for the AI API.
   * Leave as an empty line
   */
  AI_API_KEY: z.string(),
  /**
   * Instagram browser User-Agent.
   */
  SCRAPER_USERAGENT: z.string(),
  /**
   * Instagram session cookies.
   * Should be a string with cookies in the format: "cookie1=value1; cookie2=value2; ..."
   */
  SCRAPER_COOKIES: z.string(),
  /**
   * Minimum like count for a post.
   */
  MIN_LIKE_COUNT: z.number().int().min(0).default(50),
})

export const parse = validator.safeParse(process.env)

if (!parse.success) {
  console.error('Invalid env:', parse.error.message)
  process.exit(1)
}

export const config = parse.data
