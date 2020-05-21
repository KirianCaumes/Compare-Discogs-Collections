const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const defaultController = new (require('./controllers/default'))()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/node_modules/bulma/css'))
app.use(express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/js'))
app.use(express.static(__dirname + '/public/style'))
app.use(express.static(__dirname + '/public/img'))
require('dotenv').config()

app.get('/', defaultController.getMain.bind(defaultController))
app.post('/', defaultController.postMain.bind(defaultController))

app.listen(process.env.PORT || 3000)