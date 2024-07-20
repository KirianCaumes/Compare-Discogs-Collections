import { readFile } from 'fs/promises'
import Handlebars from 'handlebars'
import { COLLECTION, WANTLIST, COLLECTIONVSWANTLIST } from 'data/constant.data'
import type { Body } from 'interfaces'
import type { DiscogsService } from 'services'
import type { AxiosError } from 'axios'
import type { Request, Response } from 'express'

/**
 * DefaultController
 */
export default class DefaultController {
    private discogsService: DiscogsService

    /**
     * @param {object} param param
     */
    constructor({
        discogsService,
    }: {
        /** DiscogsService */
        discogsService: DiscogsService
    }) {
        this.discogsService = discogsService
    }

    /**
     * Home page
     * @param _req req
     * @param res res
     */
    // eslint-disable-next-line class-methods-use-this
    public async getDefault(_req: Request, res: Response): Promise<Response> {
        return res.send(Handlebars.compile(await readFile('./src/templates/index.template.hbs', 'utf-8'))({}))
    }

    /**
     * Home page with data
     * @param req req
     * @param res res
     */
    public async postDefault(req: Request<unknown, unknown, Body>, res: Response): Promise<Response> {
        const { userOne, userTwo, search, band } = req.body

        try {
            // Get user items from API
            const [userOneItems, userTwoItems] = await Promise.all([
                this.discogsService.fetchItems({
                    search: [COLLECTION, COLLECTIONVSWANTLIST].includes(search) ? COLLECTION : WANTLIST,
                    user: userOne,
                }),
                this.discogsService.fetchItems({
                    search: search === COLLECTION ? COLLECTION : WANTLIST,
                    user: userTwo,
                }),
            ])

            /** List of unique items to be displayed */
            const items =
                userTwoItems
                    // Add "isCommon" if item on both user
                    .map(item => ({ ...item, isCommon: !!userOneItems.find(userOneItem => userOneItem.id === item.id) }))
                    // Remove duplicated items just in case
                    .filter((item, index, self) => self.findIndex(x => x.id === item.id) === index)
                    // Remove others bands if filter set
                    .filter(item =>
                        item.basic_information.artists.some(x => x.name?.toLowerCase().includes(band?.toLowerCase()) ?? true),
                    ) ?? []

            /** Number of common items */
            const commonItemsTotal = items?.filter(item => item.isCommon)?.length ?? 0

            /** Count items total by user */
            const [userOneUniqueItemsTotal, userTwoUniqueItemsTotal] = [userOneItems, userTwoItems].map(
                userItems =>
                    userItems
                        // Remove duplicated items just in case
                        .filter((userItem, index, self) => self.findIndex(x => x.id === userItem.id) === index)
                        // Remove others bands if filter set
                        .filter(userItem =>
                            userItem.basic_information.artists.some(x => x.name?.toLowerCase().includes(band?.toLowerCase()) ?? true),
                        )?.length ?? 0,
            )

            return res.send(
                Handlebars.compile(await readFile('./src/templates/index.template.hbs', 'utf-8'))({
                    error: userTwoUniqueItemsTotal === 0 ? 'No releases were found for the second user' : null,
                    items,
                    total: {
                        userOne: userOneUniqueItemsTotal,
                        userTwo: userTwoUniqueItemsTotal,
                        percent: (commonItemsTotal / userTwoUniqueItemsTotal).toLocaleString(undefined, {
                            style: 'percent',
                            minimumFractionDigits: 2,
                        }),
                        common: commonItemsTotal,
                    },
                    value: {
                        userOne,
                        userTwo,
                        band,
                        isCollection: search === COLLECTION,
                        isWantlist: search === WANTLIST,
                        isCollectionVsWantlist: search === COLLECTIONVSWANTLIST,
                    },
                }),
            )
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error)

            const err = error as AxiosError<{
                /** Message  */
                message: string
            }>

            return res.status(400).send(
                Handlebars.compile(await readFile('./src/templates/index.template.hbs', 'utf-8'))({
                    error: err.response?.data?.message ?? err.response?.data ?? err.message ?? 'Error',
                    value: {
                        userOne,
                        userTwo,
                        band,
                        isCollection: search === COLLECTION,
                        isWantlist: search === WANTLIST,
                        isCollectionVsWantlist: search === COLLECTIONVSWANTLIST,
                    },
                }),
            )
        }
    }
}
