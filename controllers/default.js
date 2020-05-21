const mustache = require('mustache')
const fs = require('fs')

const Discogs = require('../models/discogs')
const { WANTLIST, COLLECTION, COLLECTIONVSWANTLIST } = require('../constants')

module.exports = class DefaultController {
    constructor() {
        /**
         * Add method to filter uniq item in list
         */
        Object.defineProperty(Array.prototype, "toUniqId", {
            enumerable: false,
            writable: true,
            value: function () {
                const result = []
                const map = new Map()
                for (const item of this) {
                    if (!map.has(item.id)) {
                        map.set(item.id, true)
                        result.push(item)
                    }
                }
                return result
            }
        })
    }

    /**
     * Home page
     * @param {object} req
     * @param {object} res
     */
    getMain(req, res) {
        res.send(this._render({}))
    }

    /**
     * Home page with data
     * @param {object} req
     * @param {object} res
     */
    async postMain(req, res) {
        const { userone, usertwo, search, band } = req.body

        const discogs = new Discogs()

        /** Get number of pages */
        const numberPages = { userOne: 0, userTwo: 0 }
        await Promise.all([
            discogs.getNumberPages({ type: search === COLLECTION || search === COLLECTIONVSWANTLIST ? COLLECTION : WANTLIST, username: userone }),
            discogs.getNumberPages({ type: search === COLLECTION ? COLLECTION : WANTLIST, username: usertwo })
        ])
            .then(([userOne, userTwo]) => {
                numberPages.userOne = Math.ceil(userOne.data.pagination.items / 500)
                numberPages.userTwo = Math.ceil(userTwo.data.pagination.items / 500)
            })
            .catch(err => {
                res.send(this._render({ error: err ? (err.response.data ? err.response.data.message : 'Error') : 'Error', userone, usertwo, band, search }))
            })

        /** Get items  */
        const items = { userOne: [], userTwo: [] }
        await Promise.all([
            discogs.getItems({ type: search === COLLECTION || search === COLLECTIONVSWANTLIST ? COLLECTION : WANTLIST, username: userone, pages: numberPages.userOne }),
            discogs.getItems({ type: search === COLLECTION ? COLLECTION : WANTLIST, username: usertwo, pages: numberPages.userTwo })
        ])
            .then(([userOne, userTwo]) => {
                items.userOne = userOne
                    .map(x => [COLLECTION, COLLECTIONVSWANTLIST].includes(search) ? x.data.releases : x.data.wants)
                    .flat()

                items.userTwo = userTwo
                    .map(x => [COLLECTION].includes(search) ? x.data.releases : x.data.wants)
                    .flat()
            })
            .catch(err => {
                res.send(this._render({ error: err ? (err.response.data ? err.response.data.message : 'Error') : 'Error', userone, usertwo, band, search }))
            })

        res.send(this._render({ items, userone, usertwo, band, search }))
    }

    /**
     * Render
     * @param {object} data 
     * @param {object=} data.items Items found
     * @param {object=} data.items.userOne Items found userone
     * @param {object=} data.items.userTwo Items found usertwo
     * @param {string=} data.error Error to display
     * @param {string} data.userone Username
     * @param {string} data.usertwo Username
     * @param {string=} data.band Bandname
     * @param {string} data.search Search string
     * @returns {string} HTML rendered
     */
    _render({ items = {}, error = null, userone = '', usertwo = '', band = '', search = COLLECTION } = {}) {
        /** List of ids from user one */
        const userOneIds = !items.userOne ? [] : items.userOne.map(x => x.id)

        /** List of uniq items found on user two (item displayed); adding common items between two users */
        const itemsFound = !items.userTwo ? [] : items.userTwo
            .map(el => ({ ...el, include: userOneIds.includes(el.id) }))
            .filter(el => el.basic_information.artists.some(x => x.name ? x.name.toLowerCase().includes(band ? band.toLowerCase() : '') : null))
            .toUniqId()

        /** List of uniq items on user one (used for stats) */
        const useroneFilter = !items.userOne ? [] : items.userOne
            .filter(el => el.basic_information.artists.some(x => x.name ? x.name.toLowerCase().includes(band ? band.toLowerCase() : '') : null))
            .toUniqId()

        /** List of uniq items on user two (used for stats) */
        const usertwoFilter = !items.userTwo ? [] : items.userTwo
            .filter(el => el.basic_information.artists.some(x => x.name ? x.name.toLowerCase().includes(band ? band.toLowerCase() : '') : null))
            .toUniqId()

        /** Number of common items */
        const commonItems = !itemsFound.length ? [] : itemsFound.filter(el => userOneIds.includes(el.id)).length

        return mustache.render(
            fs.readFileSync("./public/index.html").toString(),
            {
                error: error,
                items: itemsFound,
                total: {
                    userone: useroneFilter.length,
                    usertwo: usertwoFilter.length,
                    percent: (100 * commonItems / usertwoFilter.length).toFixed(2),
                    common: commonItems
                },
                value: {
                    userone: userone,
                    usertwo: usertwo,
                    band: band,
                    isCollection: search === COLLECTION,
                    isWantlist: search === WANTLIST,
                    isCollectionVsWantlist: search === COLLECTIONVSWANTLIST
                }
            }
        )
    }
}