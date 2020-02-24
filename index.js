const express = require('express')
const app = express()
const fs = require('fs')
const mustache = require('mustache')
const bodyParser = require('body-parser')

const Discogs = require('./models/discogs')
const { WANTLIST, COLLECTION, COLLECTIONVSWANTLIST } = require('./constants')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/node_modules/bulma/css'))
app.use(express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/js'))
app.use(express.static(__dirname + '/style'))

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

app.get('/', (req, res) => {
    res.send(render({}))
})

app.post('/', async (req, res) => {
    const { userone, usertwo, search, band } = req.body

    const discogs = new Discogs()

    //Get number of pages
    let numberPages = { userOne: 0, userTwo: 0 }
    await Promise.all([
        discogs.getNumberPages({ type: search === COLLECTION || search === COLLECTIONVSWANTLIST ? COLLECTION : WANTLIST, username: userone }),
        discogs.getNumberPages({ type: search === COLLECTION ? COLLECTION : WANTLIST, username: usertwo })
    ])
        .then(([userOne, userTwo]) => {
            numberPages.userOne = JSON.parse(userOne).pagination.pages
            numberPages.userTwo = JSON.parse(userTwo).pagination.pages
        })
        .catch(err => res.send(render({ error: err ? (JSON.parse(err.error) ? JSON.parse(err.error).message : 'Error') : 'Error', userone, usertwo, band, search })))

    //Get items
    let items = { userOne: [], userTwo: [] }
    await Promise.all([
        discogs.getItems({ type: search === COLLECTION || search === COLLECTIONVSWANTLIST ? COLLECTION : WANTLIST, username: userone, pages: numberPages.userOne }),
        discogs.getItems({ type: search === COLLECTION ? COLLECTION : WANTLIST, username: usertwo, pages: numberPages.userTwo })
    ])
        .then(([userOne, userTwo]) => {
            for (const x of userOne) {
                if (search === COLLECTION || search === COLLECTIONVSWANTLIST) {
                    items.userOne = items.userOne.concat(JSON.parse(x).releases)
                } else {
                    items.userOne = items.userOne.concat(JSON.parse(x).wants)
                }
            }

            for (const x of userTwo) {
                if (search === COLLECTION) {
                    items.userTwo = items.userTwo.concat(JSON.parse(x).releases)
                } else {
                    items.userTwo = items.userTwo.concat(JSON.parse(x).wants)
                }
            }
        })
        .catch(err => res.send(render({ error: err ? (JSON.parse(err.error) ? JSON.parse(err.error).message : 'Error') : 'Error', userone, usertwo, band, search })))

    res.send(render({ items, userone, usertwo, band, search }))
})

function render({ items = {}, error = null, userone = '', usertwo = '', band = '', search = '' }) {
    const userOneIds = !items.userOne ? [] : items.userOne.map(x => x.id)
    const itemsFound = !items.userTwo ? [] : items.userTwo
        .map(el => { return { ...el, include: userOneIds.includes(el.id) } })
        .filter(el => el.basic_information.artists.some(x => x.name ? x.name.toLowerCase().includes(band ? band.toLowerCase() : '') : null))
        .toUniqId()

    const useroneFilter = !items.userOne ? [] : items.userOne
        .filter(el => el.basic_information.artists.some(x => x.name ? x.name.toLowerCase().includes(band ? band.toLowerCase() : '') : null))
        .toUniqId()

    const usertwoFilter = !items.userTwo ? [] : items.userTwo
        .filter(el => el.basic_information.artists.some(x => x.name ? x.name.toLowerCase().includes(band ? band.toLowerCase() : '') : null))
        .toUniqId()

    const commonItems = !itemsFound.length ? [] : itemsFound.filter(el => userOneIds.includes(el.id)).length

    return mustache.render(
        fs.readFileSync("index.html").toString(),
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

app.listen(process.env.PORT || 3000)