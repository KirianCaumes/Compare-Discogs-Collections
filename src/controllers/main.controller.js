import { readFileSync } from 'fs'
import mustach from 'mustache'
import { COLLECTION, COLLECTIONVSWANTLIST, WANTLIST } from '../data/constants.data'

const indexHtml = readFileSync('./templates/index.html').toString()

/**
 * MainController
 */
export default class MainController {
    /** @type {import('../services').DiscogsService} */
    #discogsService = null

    /**
     * @param {object} param param
     * @param {import('../services').DiscogsService} param.discogsService discogsService
     */
    constructor({ discogsService }) {
        this.#discogsService = discogsService
    }

    /**
     * Home page
     * @param {import('express').Request} req Req
     * @param {import('express').Response} res Res
     * @returns {import('express-serve-static-core').Response} Response
     */
    // eslint-disable-next-line class-methods-use-this
    getMain(req, res) {
        return res.send(mustach.render(indexHtml, {}))
    }

    /**
     * Home page with data
     * @param {import('express').Request<any, any, BodyType>} req Req
     * @param {import('express').Response} res Res
     * @returns {Promise<import('express-serve-static-core').Response>} Response
     */
    async postMain(req, res) {
        const {
            userone, usertwo, search, band,
        } = req.body

        try {
            const {
                items,
                userOneNumberItems,
                userTwoNumberItems,
                commonNumberItems,
            } = await this.#discogsService.getItems({
                band, search, userone, usertwo,
            })

            return res.send(mustach.render(indexHtml, {
                items,
                total: {
                    userone: userOneNumberItems,
                    usertwo: userTwoNumberItems,
                    percent: ((100 * commonNumberItems) / userTwoNumberItems).toFixed(2),
                    common: commonNumberItems,
                },
                value: {
                    userone,
                    usertwo,
                    band,
                    isCollection: search === COLLECTION,
                    isWantlist: search === WANTLIST,
                    isCollectionVsWantlist: search === COLLECTIONVSWANTLIST,
                },
            }))
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error)

            return res.send(mustach.render(indexHtml, {
                error: error.response?.data?.message ?? error.response?.data ?? 'Error',
                value: {
                    userone,
                    usertwo,
                    band,
                    isCollection: search === COLLECTION,
                    isWantlist: search === WANTLIST,
                    isCollectionVsWantlist: search === COLLECTIONVSWANTLIST,
                },
            }))
        }
    }
}
