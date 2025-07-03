import {splitArray} from '../util/functional.ts'
import type {AxiosInstance} from 'axios'
import sharp from 'sharp'
import scoreSystemLLMPrompt from './prompts/system-profile-image-rank.txt?raw'
import {createLLMChatCompletion} from './llm-client.ts'
import {config} from '../config.ts'

export async function getLLMImageScore(
  imageUrls: Array<string>,
  client: AxiosInstance,
): Promise<Array<number>> {
  const imageBuffers: Array<string> = []

  for (const url of imageUrls) {
    try {
      const {data} = await client.get<Buffer>(url, {responseType: 'arraybuffer'})

      const imgBuffer = await sharp(data)
        .resize(600, 600, {fit: 'contain'})
        .toFormat('jpeg', {quality: 75})
        .toBuffer()

      const imgBase64Url = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`

      imageBuffers.push(imgBase64Url)
    } catch (ignore) {
    }
  }

  const batches = splitArray(imageBuffers, 5)
  const llmResponse = await Promise.all(batches.map(batch =>
    createLLMChatCompletion({
      model: config.AI_MODEL_NAME,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: scoreSystemLLMPrompt,
            },
          ],
        },
        {
          role: 'user',
          content: batch.map(url => ({
            type: 'image_url',
            image_url: {url},
          })),
        },
      ],
    }),
  ))

  const scores = llmResponse.flatMap(resp => {
    const message = resp.choices[0]?.message?.content as any
    if (!message || typeof message !== 'string') {
      throw new Error('Invalid response from LLM API')
    }

    const scoreMatch = Array.from(message.matchAll(/^\s*(\d+)/gm))
    return scoreMatch.map(match => parseInt(match[1], 10))
  })

  if (scores.length === 0) {
    throw new Error('No valid scores found in LLM response')
  }

  return scores
}