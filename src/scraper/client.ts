import axios, {type AxiosResponse} from 'axios'
import {CookieJar} from 'tough-cookie'

interface ScraperSession {
  cookies: string
  userAgent: string
}

declare module 'axios' {
  interface AxiosRequestConfig {
    jar?: CookieJar | null
  }
}

export function createScraperClient(session: ScraperSession) {

  const jar = new CookieJar()
  jar.setCookieSync(
    session.cookies,
    'https://www.instagram.com/',
  )

  const client = axios.create({
    jar,
    headers: {
      'User-Agent': session.userAgent,
    },
  })

  // request cookie interceptor
  client.interceptors.request.use(async (config) => {
    const cookieHeader = await jar.getCookieString(config.url || '')
    if (cookieHeader && !config.headers['Cookie']) {
      config.headers['Cookie'] = cookieHeader
    }

    const cookies = await jar.getCookies(config.url || '')
    const csrf = cookies.find(cookie => cookie.key === 'csrftoken')
    if (csrf && !config.headers['X-CSRFToken']) {
      config.headers['X-CSRFToken'] = csrf.value
    }

    return config
  })

  async function handleResponse(resp: AxiosResponse) {
    const setCookieHeader = resp.headers['set-cookie']
    if (setCookieHeader) {
      for (const cookie of setCookieHeader) {
        await jar.setCookie(cookie, resp.config.url || '')
      }
    }

    return resp
  }

  // response cookie interceptor
  client.interceptors.response.use(
    handleResponse,
    async err => {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          await handleResponse(err.response)
        }
      }
      throw err
    },
  )


  return client
}