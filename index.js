const express = require('express')
const app = express()
const rp = require('request-promise')
const fs = require('fs')
const mustache = require('mustache')
var bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static(__dirname + '/node_modules/bulma/css'));
app.use(express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/js'));
app.use(express.static(__dirname + '/style'));

const global = {
    baseUrl: "https://api.discogs.com/",
    collection: "users/{username}/collection/folders/0/releases?per_page=500&sort=year&sort_order=asc",
    wantlist: "/users/{username}/wants?per_page=500&sort=year&sort_order=asc",
    folders: "/users/{username}/collection/folders?"
}

const params = {
    token: "&token=uYHzoNUnYYEGTsaXPpAkrrWoaZYQOVPweJQyerdI",
}

app.get('/', (req, res) => {
    res.send(mustache.render(fs.readFileSync("index.html").toString(), {}))
})

app.post('/', async (req, res) => {
    const { userone, usertwo, isCollection, band } = req.body

    //Get number of pages
    let count = { userOne: 0, userTwo: 0 }
    if ((JSON.parse(isCollection))) {
        await Promise.all([
            rp({
                uri: global.baseUrl + global.folders.replace('{username}', userone) + params.token,
                method: 'GET',
                headers: { 'User-Agent': 'pouet' }
            }),
            rp({
                uri: global.baseUrl + global.folders.replace('{username}', usertwo) + params.token,
                method: 'GET',
                headers: { 'User-Agent': 'pouet' }
            })
        ])
            .then(([userOne, userTwo]) => {
                count.userOne = Math.ceil(JSON.parse(userOne).folders[0].count / 500)
                count.userTwo = Math.ceil(JSON.parse(userTwo).folders[0].count / 500)
            })
            .catch(err => res.json(err || 'User Not found'))
    } else {
        await Promise.all([
            rp({
                uri: global.baseUrl + global.wantlist.replace('{username}', userone) + params.token + "&page=1",
                method: 'GET',
                headers: { 'User-Agent': 'pouet' }
            }),
            rp({
                uri: global.baseUrl + global.wantlist.replace('{username}', usertwo) + params.token + "&page=1",
                method: 'GET',
                headers: { 'User-Agent': 'pouet' }
            })
        ])
            .then(([userOne, userTwo]) => {
                count.userOne = Math.ceil(JSON.parse(userOne).pagination.pages)
                count.userTwo = Math.ceil(JSON.parse(userTwo).pagination.pages)
            })
            .catch(err => res.json(err || 'User Not found'))
    }

    //Get items
    let items = { userOne: [], userTwo: [] }

    let result = []

    //...from user one
    result.push(new Promise((resolve, reject) => {
        let requests = []
        for (let i = 0; i < count.userOne; i++) {
            requests.push(rp({
                uri: global.baseUrl + (JSON.parse(isCollection) ? global.collection : global.wantlist).replace('{username}', userone) + params.token + "&page=" + (i + 1),
                method: 'GET',
                headers: {
                    'User-Agent': 'pouet'
                },
            }))
        }

        Promise.all(requests)
            .then((data) => {
                let els = []
                for (const x of JSON.parse('[' + data + ']')) {
                    if (JSON.parse(isCollection)) {
                        els = [...els, ...x.releases]
                    } else {
                        els = [...els, ...x.wants]
                    }
                }
                // items.userOne = els
                resolve(els)
            })
            .catch(err => reject(err || 'User Not found'))
    }))


    //...from user two
    result.push(new Promise((resolve, reject) => {
        requests = []
        for (let i = 0; i < count.userTwo; i++) {
            requests.push(rp({
                uri: global.baseUrl + (JSON.parse(isCollection) ? global.collection : global.wantlist).replace('{username}', usertwo) + params.token + "&page=" + (i + 1),
                method: 'GET',
                headers: {
                    'User-Agent': 'pouet'
                },
            }))
        }
        Promise.all(requests)
            .then((data) => {
                let els = []
                for (const x of JSON.parse('[' + data + ']')) {
                    if (JSON.parse(isCollection)) {
                        els = [...els, ...x.releases]
                    } else {
                        els = [...els, ...x.wants]
                    }
                }
                // items.userTwo = els
                resolve(els)
            })
            .catch(err => reject(err || 'User Not found'))
    }))

    await Promise.all(result)
        .then(([dataone, datatwo]) => {
            items.userOne = dataone
            items.userTwo = datatwo
        })
        .catch(err => res.json(err || 'User Not found'))

    //Render
    userOneIds = items.userOne.map(x => x.id)
    itemsFound = items.userTwo
        .map(el => { return { ...el, include: userOneIds.includes(el.id) } })
        .filter(el => el.basic_information.artists.every(x => x.name ? x.name.toLowerCase().includes(band ? band.toLowerCase() : '') : null))

    res.send(
        mustache.render(
            fs.readFileSync("index.html").toString(),
            {
                items: itemsFound,
                total: {
                    userone: userOneIds.length,
                    usertwo: itemsFound.length,
                    common: itemsFound.filter(el => userOneIds.includes(el.id)).length
                },
                value: {
                    userone: userone,
                    usertwo: usertwo,
                    band: band,
                    isCollection: JSON.parse(isCollection),
                    isWantlist: !JSON.parse(isCollection)
                }
            }
        )
    )
})

app.listen(process.env.PORT || 3000)