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
    wantlist: "/users/{username}/wants?per_page=500&sort=year&sort_order=asc"
}

const params = {
    userOne: "Kirian_",
    userTwo: "svante.persson",
    token: "&token=uYHzoNUnYYEGTsaXPpAkrrWoaZYQOVPweJQyerdI",
    isCollection: false
}

app.get('/', (req, res) => {
    res.send(mustache.render(fs.readFileSync("index.html").toString(), {}))
})

app.post('/', (req, res) => {
    const { userone, usertwo, isCollection } = req.body

    let requests = []
    requests.push(rp({
        uri: global.baseUrl + (JSON.parse(isCollection) ? global.collection : global.wantlist).replace('{username}', userone) + params.token,
        method: 'GET',
        headers: {
            'User-Agent': 'pouet'
        },
    }))
    requests.push(rp({
        uri: global.baseUrl + (JSON.parse(isCollection) ? global.collection : global.wantlist).replace('{username}', usertwo) + params.token,
        method: 'GET',
        headers: {
            'User-Agent': 'pouet'
        },
    }))

    Promise.all(requests)
        .then(([userOne, userTwo]) => {
            if (JSON.parse(isCollection)) {
                userOne = JSON.parse(userOne).releases
                userTwo = JSON.parse(userTwo).releases
                userOneIds = userOne.map(x => x.id)

                res.send(
                    mustache.render(
                        fs.readFileSync("index.html").toString(),
                        {
                            items: userTwo.map(el => {
                                return {
                                    ...el,
                                    include: userOneIds.includes(el.id)
                                }
                            }),
                            total: {
                                userone: userOneIds.length,
                                usertwo: userTwo.map(x => x.id).length,
                                common: userTwo.filter(el => userOneIds.includes(el.id)).length
                            },
                            value: {
                                userone, usertwo,
                                isCollection: JSON.parse(isCollection),
                                isWantlist: !JSON.parse(isCollection)
                            }
                        }
                    )
                )
            } else {
                userOne = JSON.parse(userOne).wants
                userTwo = JSON.parse(userTwo).wants
                userOneIds = userOne.map(x => x.id)

                res.send(
                    mustache.render(
                        fs.readFileSync("index.html").toString(),
                        {
                            items: userTwo.map(el => {
                                return {
                                    ...el,
                                    include: userOneIds.includes(el.id)
                                }
                            }),
                            total: {
                                userone: userOneIds.length,
                                usertwo: userTwo.map(x => x.id).length,
                                common: userTwo.filter(el => userOneIds.includes(el.id)).length
                            },
                            value: {
                                userone, usertwo,
                                isCollection: JSON.parse(isCollection),
                                isWantlist: !JSON.parse(isCollection)
                            }
                        }
                    )
                )
            }
        })
        .catch(err => res.json(err || 'User Not found'))
})

app.listen(process.env.PORT || 3000)