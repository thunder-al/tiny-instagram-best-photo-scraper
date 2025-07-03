import axios from 'axios'
import {config} from '../config.ts'

const client = axios.create({
  baseURL: config.AI_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.AI_API_KEY}`,
  },
})

export type MessageContent =
  | string
  | { type: 'text', text: string }
  | { type: 'image_url', image_url: { url: string, detail?: 'low' | 'high' | 'auto' } }

export type Message = {
  role: 'system' | 'user' | 'assistant' | 'function'
  content: string | MessageContent[]
  name?: string
}

export type ChatCompletionRequest = {
  model: string
  messages: Message[]
  temperature?: number
  top_p?: number
  n?: number
  stream?: boolean
  max_tokens?: number
  presence_penalty?: number
  frequency_penalty?: number
}

export type ChatCompletionResponse = {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: {
      role: 'system' | 'user' | 'assistant' | 'function'
      content: string | null // OpenAI may return null for function/tool calls
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * OpenAI like Chat Completion API
 */
export async function createLLMChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  const response = await client.post('/v1/chat/completions', request)
  return response.data
}
