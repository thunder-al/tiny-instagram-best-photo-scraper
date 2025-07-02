import {type AxiosInstance} from 'axios'

export interface ScrapeUserFeedResponse {
  data: {
    xdt_api__v1__feed__user_timeline_graphql_connection: {
      edges: Array<{
        node: {
          code: string // DLnIOXeshcc
          pk: string // 3667936593172371228
          id: string // 3667936593172371228_25025320,
          like_count: number // 1234
          caption: {
            created_at: number // timestamp in seconds
            text: string // some description text,
          },
          image_versions2: {
            candidates: Array<{
              url: string // https image url
              height: number
              width: number
            }>
          },
          user: {
            pk: string // 25025320,
            username: string // instagram
            profile_pic_url: string // https image url
            is_private: boolean
            id: string // 25025320
            hd_profile_pic_url_info: {
              url: string // https image url
            },
            full_name: string // Instagram
          },
        },
      }>
      page_info: {
        end_cursor: string // 3662139031710513427_25025320
        has_next_page: boolean
        has_previous_page: boolean
      }
    }
  }
}

export async function scrapeUserFeedItems(client: AxiosInstance, username: string, count = 12): Promise<ScrapeUserFeedResponse> {
  const params = new URLSearchParams()

  params.append('fb_api_caller_class', 'RelayModern')
  params.append('fb_api_req_friendly_name', 'PolarisProfilePostsQuery')
  params.append('variables', JSON.stringify({
    data: {
      count: count,
      include_reel_media_seen_timestamp: true,
      include_relationship_info: true,
      latest_besties_reel_media: true,
      latest_reel_media: true,
    },
    username: username,
    __relay_internal__pv__PolarisIsLoggedInrelayprovider: true,
    __relay_internal__pv__PolarisFetchCrosspostMetadatarelayprovider: false,
    __relay_internal__pv__PolarisShareSheetV3relayprovider: true,
  }))
  params.append('server_timestamps', 'true') // UTC ???
  params.append('doc_id', '24440175195589543') // query document ID

  const {data} = await client.post<ScrapeUserFeedResponse>(
    'https://www.instagram.com/graphql/query',
    params.toString(),
    {
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-FB-Friendly-Name': 'PolarisProfilePostsQuery',
        'Origin': 'https://www.instagram.com',
        'DNT': '1',
        'Sec-GPC': '1',
        'Connection': 'keep-alive',
        'Referer': `https://www.instagram.com/${username}/?hl=en`,
        'TE': 'trailers',
      },
    },
  )

  return data
}
