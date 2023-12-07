import axios from 'axios'
import { COLLECTION, COLLECTIONVSWANTLIST, WANTLIST } from '../data/constants.data.js'

/**
 * @class Discogs Service
 */
export default class DiscogsService {
    #baseUrl = 'https://api.discogs.com/'

    #url = {
        collection: 'users/{username}/collection/folders/0/releases',
        wantlist: '/users/{username}/wants',
    }

    /**
     * Get number of pages for a given user
     * @param {object} param Param
     * @param {string=} param.type Type of search
     * @param {string=} param.username Username to search
     * @returns {Promise<import('axios').AxiosResponse<ApiWantlistResultType | ApiCollectionResultType>>} Objects from discogs
     */
    #fetchNumberPages({ type = WANTLIST, username = '' } = {}) {
        return axios.get(
            `${this.#baseUrl}${this.#url[type.toLowerCase()].replace('{username}', username)}`,
            {
                params: {
                    per_page: 1,
                    sort: 'year',
                    sort_order: 'asc',
                    page: 1,
                    token: process.env.DISCOGS_API_KEY,
                },
                headers: {
                    'User-Agent': 'discogscomparetwocollection',
                },
            },
        )
    }

    /**
     * Get objects from discogs
     * @param {object} param Param
     * @param {string=} param.type Type of search
     * @param {string=} param.username Username to search
     * @param {number=} param.pages Number of pages to search
     * @returns {Promise<import('axios').AxiosResponse<ApiWantlistResultType | ApiCollectionResultType>[]>} Objects from discogs
     */
    #fetchItems({ type = WANTLIST, username = '', pages = 0 } = {}) {
        return Promise.all(new Array(pages)
            .fill({})
            .map((_, i) => axios.get(
                `${this.#baseUrl}${this.#url[type.toLowerCase()].replace('{username}', username)}`,
                {
                    params: {
                        per_page: '500',
                        sort: 'year',
                        sort_order: 'asc',
                        page: i + 1,
                        token: process.env.DISCOGS_API_KEY,
                    },
                    headers: {
                        'User-Agent': 'discogscomparetwocollection',
                    },
                },
            )))
    }

    /**
     * Get all items
     * @param {object} param Param
     * @param {string} param.search Type of search
     * @param {string} param.userone Username one
     * @param {string} param.usertwo Username two
     * @param {string} param.band Band
     * @returns {Promise<{
     *  items: (Partial<ApiCollectionResultType['releases'][0]> & { isCommon: boolean })[]
     *  userOneNumberItems: number
     *  userTwoNumberItems: number
     *  commonNumberItems: number
     * }>} Returns
     */
    async getItems({
        search = '',
        userone = '',
        usertwo = '',
        band = '',
    }) {
        const [userOnePagesRes, userTwoPagesRes] = await Promise.all([
            this.#fetchNumberPages({
                type: search === COLLECTION || search === COLLECTIONVSWANTLIST
                    ? COLLECTION
                    : WANTLIST,
                username: userone,
            }),
            this.#fetchNumberPages({
                type: search === COLLECTION
                    ? COLLECTION
                    : WANTLIST,
                username: usertwo,
            }),
        ])

        const [userOneItemsRes, userTwoItemsRes] = await Promise.all([
            this.#fetchItems({
                type: search === COLLECTION || search === COLLECTIONVSWANTLIST
                    ? COLLECTION
                    : WANTLIST,
                username: userone,
                pages: Math.ceil(userOnePagesRes.data.pagination.items / 500),
            }),
            this.#fetchItems({
                type: search === COLLECTION
                    ? COLLECTION : WANTLIST,
                username: usertwo,
                pages: Math.ceil(userTwoPagesRes.data.pagination.items / 500),
            }),
        ])

        const userOneItems = userOneItemsRes
            .map(x => ([COLLECTION, COLLECTIONVSWANTLIST].includes(search)
                ? /** @type {ApiCollectionResultType} */(x.data).releases
                : /** @type {ApiWantlistResultType} */(x.data).wants))
            .flat()

        const userTwoItems = userTwoItemsRes
            .map(x => ([COLLECTION].includes(search)
                ? /** @type {ApiCollectionResultType} */(x.data).releases
                : /** @type {ApiWantlistResultType} */(x.data).wants))
            .flat()

        /** List of ids from user one */
        const userOneIds = userOneItems?.map(x => x.id) ?? []

        const bandName = band?.toLowerCase() ?? ''

        /** List of unique items found on user two (item displayed); adding common items between two users */
        const items = userTwoItems
            .map(item => ({
                ...item,
                isCommon: userOneIds.includes(item.id),
            }))
            .filter((item, index, self) => self.findIndex(x => x.id === item.id) === index)
            .filter(item => item.basic_information.artists.some(x => x.name?.toLowerCase().includes(bandName) ?? true)) ?? []

        return {
            items,
            /** List of unique items on user one (used for stats) */
            userOneNumberItems: userOneItems
                .filter((item, index, self) => self.findIndex(x => x.id === item.id) === index)
                .filter(item => item.basic_information.artists.some(x => x.name?.toLowerCase().includes(bandName) ?? true))?.length ?? 0,
            /** List of unique items on user two (used for stats) */
            userTwoNumberItems: userTwoItems
                .filter((item, index, self) => self.findIndex(x => x.id === item.id) === index)
                .filter(item => item.basic_information.artists.some(x => x.name?.toLowerCase().includes(bandName) ?? true))?.length ?? 0,
            /** Number of common items */
            commonNumberItems: items?.filter(el => userOneIds.includes(el.id))?.length ?? 0,
        }
    }
}
