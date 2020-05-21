const { WANTLIST } = require('../constants')
const axios = require('axios').default

/**
 * @class Discogs 
 */
module.exports = class Discogs {
    constructor() {
        this.baseUrl = "https://api.discogs.com/"
        this.collection = "users/{username}/collection/folders/0/releases"
        this.wantlist = "/users/{username}/wants"
    }

    /**
     * Get number of pages for a given user
     * @param {object} data 
     * @param {string} type Type of search
     * @param {string} username Username to search
     * @returns {Promise<object>} Objects from discogs
     */
    getNumberPages({ type = WANTLIST, username = '' } = {}) {
        return axios.get(this.baseUrl + this[type.toLowerCase()].replace('{username}', username), {
            params: {
                per_page: 25,
                sort: 'year',
                sort_order: 'asc',
                page: 1,
                token: process.env.TOKEN
            },
            headers: {
                'User-Agent': 'discogscomparetwocollection'
            }
        })
    }

    /**
     * Get objects from discogs
     * @param {object} data 
     * @param {string} data.type Type of search
     * @param {string} data.username Username to search
     * @param {number} data.pages Number of pages to search
     * @returns {Promise<object>} Objects from discogs
     */
    getItems({ type = WANTLIST, username = '', pages = 0 } = {}) {
        let requests = []
        for (let i = 0; i < pages; i++) {
            requests.push(axios.get(this.baseUrl + this[type.toLowerCase()].replace('{username}', username), {
                params: {
                    per_page: '500',
                    sort: 'year',
                    sort_order: 'asc',
                    page: i + 1,
                    token: process.env.TOKEN
                },
                headers: {
                    'User-Agent': 'discogscomparetwocollection'
                }
            }))
        }
        return Promise.all(requests)
    }
}