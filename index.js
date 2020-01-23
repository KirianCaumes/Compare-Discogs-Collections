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
    const { userone, usertwo, isCollection } = req.body

    let requestsCount = []
    requestsCount.push(rp({
        uri: global.baseUrl + global.folders.replace('{username}', userone) + params.token,
        method: 'GET',
        headers: { 'User-Agent': 'pouet' }
    }))
    requestsCount.push(rp({
        uri: global.baseUrl + global.folders.replace('{username}', usertwo) + params.token,
        method: 'GET',
        headers: { 'User-Agent': 'pouet' }
    }))

    let count = { userOne: 0, userTwo: 0 }
    await Promise.all(requestsCount)
        .then(([userOne, userTwo]) => {
            count.userOne = Math.ceil(JSON.parse(userOne).folders[0].count / 500)
            count.userTwo = Math.ceil(JSON.parse(userTwo).folders[0].count / 500)
        })
        .catch(err => res.json(err || 'User Not found'))

    let items = { userOne: 0, userTwo: 0 }
    let requests = []
    for (let i = 0; i < count.userOne; i++) {
        console.log(global.baseUrl + (JSON.parse(isCollection) ? global.collection : global.wantlist).replace('{username}', userone) + params.token + "&page=" + (i + 1))
        requests.push(rp({
            uri: global.baseUrl + (JSON.parse(isCollection) ? global.collection : global.wantlist).replace('{username}', userone) + params.token + "&page=" + (i + 1),
            method: 'GET',
            headers: {
                'User-Agent': 'pouet'
            },
        }))
    }
    console.log("cc")

    await Promise.all(requests)
        .then((data) => {
            let els = []
            // data.forEach(x => console.log(x.releases[0]))
            JSON.parse(data).forEach(x => x.releases.forEach(y => els.push(y)))
            console.log(els)
            items.userOne = els
        })
        .catch(err => res.json(err || 'User Not found'))

    res.json(items)

    // requests = []
    // for (let i = 0; i < count.userTwo; i++) {
    //     requests.push(rp({
    //         uri: global.baseUrl + (JSON.parse(isCollection) ? global.collection : global.wantlist).replace('{username}', usertwo) + params.token + "&page=" + i,
    //         method: 'GET',
    //         headers: {
    //             'User-Agent': 'pouet'
    //         },
    //     }))
    // }
    // await Promise.all(requests)
    //     .then((data) => {
    //         items.userTwo = data.map(x => x.releases)
    //     })
    //     .catch(err => res.json(err || 'User Not found'))

    // res.json(count)


    // Promise.all(requests)
    //     .then(([userOne, userTwo]) => {
    //         if (JSON.parse(isCollection)) {
    //             userOne = JSON.parse(userOne).releases
    //             userTwo = JSON.parse(userTwo).releases
    //             userOneIds = userOne.map(x => x.id)

    //             res.send(
    //                 mustache.render(
    //                     fs.readFileSync("index.html").toString(),
    //                     {
    //                         items: userTwo.map(el => {
    //                             return {
    //                                 ...el,
    //                                 include: userOneIds.includes(el.id)
    //                             }
    //                         }),
    //                         total: {
    //                             userone: userOneIds.length,
    //                             usertwo: userTwo.map(x => x.id).length,
    //                             common: userTwo.filter(el => userOneIds.includes(el.id)).length
    //                         },
    //                         value: {
    //                             userone, usertwo,
    //                             isCollection: JSON.parse(isCollection),
    //                             isWantlist: !JSON.parse(isCollection)
    //                         }
    //                     }
    //                 )
    //             )
    //         } else {
    //             userOne = JSON.parse(userOne).wants
    //             userTwo = JSON.parse(userTwo).wants
    //             userOneIds = userOne.map(x => x.id)

    //             res.send(
    //                 mustache.render(
    //                     fs.readFileSync("index.html").toString(),
    //                     {
    //                         items: userTwo.map(el => {
    //                             return {
    //                                 ...el,
    //                                 include: userOneIds.includes(el.id)
    //                             }
    //                         }),
    //                         total: {
    //                             userone: userOneIds.length,
    //                             usertwo: userTwo.map(x => x.id).length,
    //                             common: userTwo.filter(el => userOneIds.includes(el.id)).length
    //                         },
    //                         value: {
    //                             userone, usertwo,
    //                             isCollection: JSON.parse(isCollection),
    //                             isWantlist: !JSON.parse(isCollection)
    //                         }
    //                     }
    //                 )
    //             )
    //         }
    //     })
    //     .catch(err => res.json(err || 'User Not found'))
})

app.listen(process.env.PORT || 3000)