const { WANTLIST } = require('../constants')
const rp = require('request-promise')

module.exports = class Discogs {
    constructor() {
        this.global = {
            baseUrl: "https://api.discogs.com/",
            collection: "users/{username}/collection/folders/0/releases?per_page=500&sort=year&sort_order=asc",
            wantlist: "/users/{username}/wants?per_page=500&sort=year&sort_order=asc",
            folders: "/users/{username}/collection/folders?"
        }

        this.params = {
            token: "&token=uYHzoNUnYYEGTsaXPpAkrrWoaZYQOVPweJQyerdI",
        }
    }

    getNumberPages({ type = WANTLIST, username = '' }) {
        return rp({
            uri: this.global.baseUrl + this.global[type.toLowerCase()].replace('{username}', username) + this.params.token + "&page=1",
            method: 'GET',
            headers: { 'User-Agent': 'pouet' }
        })
    }


    getItems({ type = WANTLIST, username = '', pages }) {
        let requests = []
        for (let i = 0; i < pages; i++) {
            requests.push(rp({
                uri: this.global.baseUrl + this.global[type.toLowerCase()].replace('{username}', username) + this.params.token + "&page=" + (i + 1),
                method: 'GET',
                headers: {
                    'User-Agent': 'pouet'
                },
            }))
        }
        return Promise.all(requests)
    }
}