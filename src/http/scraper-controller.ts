import type {FastifyInstance} from 'fastify'
import {createScraperClient} from '../scraper/client.ts'
import {config} from '../config.ts'
import {scrapeUserFeedItems} from '../scraper/requests.ts'
import {safePromise} from '../util/functional.ts'
import {createError} from '@fastify/error'
import {getLLMImageScore} from '../llm/llm-image-score.ts'

const ScrapeError = createError('APP_SCRAPE_ERROR', 'Failed to scrape user feed items: %s', 400)
const ProcessError = createError('APP_SCRAPE_PROCESS_ERROR', 'Failed to process feed items: %s', 400)

export async function scraperController(http: FastifyInstance) {

  const scraperClient = createScraperClient({
    cookies: config.SCRAPER_COOKIES,
    userAgent: config.SCRAPER_USERAGENT,
  })

  const minLikeCount = config.MIN_LIKE_COUNT

  http.route<{ Querystring: { username: string } }>({
    method: 'GET',
    url: '/api/scrape/best-user-picture',
    schema: {
      querystring: {
        type: 'object',
        properties: {
          username: {type: 'string', minLength: 1},
        },
        required: ['username'],
      },
    },
    async handler(req) {
      const username: string = req.query.username

      req.log.debug({username}, 'Scraping user feed items')

      const [scraped, scrapedErr] = await safePromise(scrapeUserFeedItems(scraperClient, username))
      if (scrapedErr) {
        req.log.error({username, error: scrapedErr}, 'Failed to scrape user feed items')
        throw new ScrapeError(scrapedErr.message)
      }

      const items = scraped?.data?.xdt_api__v1__feed__user_timeline_graphql_connection?.edges
      if (!items || items.length === 0) {
        const msg = `No items found in user feed for user or request failed silently`
        req.log.warn({username}, msg)
        throw new ScrapeError(msg)
      }

      interface ScrapedPicture {
        url: string
        height: number
        width: number
        likeCount: number
      }

      const postWithLikes = items.map(el => ({
        likeCount: el.node.like_count || 0,
        images: el.node.image_versions2.candidates,
      }))

      // select the best quality image for each post
      // and filter out those with like count less than minLikeCount
      const bestPostPictures = postWithLikes.flatMap(post => {
        const likeCount = post.likeCount
        const images = post.images

        let currentImage: ScrapedPicture | null = null

        for (const img of images) {
          if (!currentImage) {
            currentImage = {
              url: img.url,
              height: img.height,
              width: img.width,
              likeCount: likeCount,
            }
            continue
          }

          const currentVolume = currentImage.height * currentImage.width
          const newVolume = img.height * img.width

          if (newVolume > currentVolume) {
            currentImage = {
              url: img.url,
              height: img.height,
              width: img.width,
              likeCount: likeCount,
            }
          }
        }

        if (!currentImage || currentImage.likeCount < minLikeCount) {
          return []
        }

        return [currentImage]
      })

      req.log.debug({username, count: bestPostPictures.length}, 'Found posts in user feed')

      req.log.debug({username, count: bestPostPictures.length}, 'Performing LLM ranking of pictures')
      const imageUrls = bestPostPictures.map(picture => picture.url)
      const [ranks, ranksError] = await safePromise(getLLMImageScore(imageUrls, scraperClient))
      if (ranksError) {
        req.log.error({username, error: ranksError}, 'Failed to get LLM image scores')
        throw new ProcessError(ranksError.message)
      }

      const rankedPictures = bestPostPictures.map((pic, idx) => ({
        ...pic,
        llmRank: ranks[idx] || 0,
      }))

      rankedPictures.sort((a, b) => b.llmRank - a.llmRank)

      req.log.debug({username, ranks: ranks}, 'Images where successfully ranked by LLM')

      return {
        username,
        items: rankedPictures
          .filter(el => el.llmRank >= config.MIN_LLM_IMAGE_RANK_SCORE),
      }
    },
  })

}