import {createScraperClient} from './scraper/client.ts'
import {config} from './config.ts'
import {scrapeUserFeedItems} from './scraper/requests.ts'

const client = createScraperClient({
  cookies: config.SCRAPER_COOKIES,
  userAgent: config.SCRAPER_USERAGENT,
})

const data = await scrapeUserFeedItems(
  client,
  'instagram',
)

console.log(data)