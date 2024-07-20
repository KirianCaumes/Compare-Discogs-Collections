import axios from 'axios'
import type { COLLECTION, WANTLIST } from 'data/constant.data'
import type { AxiosInstance } from 'axios'
import type { ApiCollectionResult, ApiWantlistResult } from 'interfaces'

/**
 * @class Discogs Service
 */
export default class DiscogsService {
    private parPage = 500 as const

    private url = {
        collection: 'users/{username}/collection/folders/0/releases',
        wantlist: '/users/{username}/wants',
    } as const

    private request: AxiosInstance['request']

    constructor() {
        const { request } = axios.create({
            baseURL: 'https://api.discogs.com/',
            headers: {
                'User-Agent': 'discogs-compare-two-collections',
            },
            params: {
                token: process.env.DISCOGS_API_KEY,
            },
        })

        this.request = request
    }

    /**
     * Get objects from discogs
     */
    public async fetchItems({
        search,
        user,
    }: {
        /** Type of search */
        search: typeof COLLECTION | typeof WANTLIST
        /** Username to search */
        user: string
    }): Promise<Array<ApiCollectionResult['releases'][0] | ApiWantlistResult['wants'][0]>> {
        const url = `${this.url[search.toLowerCase() as keyof typeof this.url].replace('{username}', user)}`

        const pages = Math.ceil(
            ((
                await this.request<ApiWantlistResult | ApiCollectionResult>({
                    url,
                    params: {
                        per_page: 1,
                        sort: 'year',
                        sort_order: 'asc',
                        page: 1,
                    },
                })
            )?.data.pagination.items ?? 0) / this.parPage,
        )

        return (
            await Promise.all(
                new Array(pages).fill({}).map((_, i) =>
                    this.request<ApiWantlistResult | ApiCollectionResult>({
                        url,
                        params: {
                            per_page: this.parPage,
                            sort: 'year',
                            sort_order: 'asc',
                            page: i + 1,
                        },
                    }),
                ),
            )
        )
            .map(x => {
                if ('wants' in x.data) {
                    return x.data.wants
                }
                if ('releases' in x.data) {
                    return x.data.releases
                }
                return []
            })
            .flat()
    }
}
