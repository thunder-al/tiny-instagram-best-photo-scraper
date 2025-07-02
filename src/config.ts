import {z} from 'zod'

const validator = z.object({
  /**
   * Base url to OpenAI like API
   */
  AI_API_URL: z.string().url(),
  /**
   * API key for the AI API.
   * Leave as an empty line
   */
  AI_API_KEY: z.string(),
})

export const parse = validator.safeParse(process.env)

if (!parse.success) {
  console.error('Invalid env:', parse.error.message)
  process.exit(1)
}

export const config = parse.data
