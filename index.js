const express = require('express')
const app = express()
const rp = require('request-promise')
const fs = require('fs')
const mustache = require('mustache')
var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

const global = {
    baseUrl: "https://api.discogs.com/",
    collection: "users/{username}/collection/folders/0/releases?per_page=500",
    wantlist: "/users/{username}/wants?per_page=500"
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
                            items: userTwo.filter(el => !userOneIds.includes(el.id))
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
                            items: userTwo.filter(el => !userOneIds.includes(el.id))
                        }
                    )
                )
            }
        })
    .catch(err => res.json(err || 'User Not found'))
})

app.listen(3000, () => console.log('App listening on port 3000'))