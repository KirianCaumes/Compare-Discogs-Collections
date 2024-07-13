import express from 'express'
import * as dotenv from 'dotenv'
import { MainController } from './controllers/index.js'
import { DiscogsService } from './services/index.js'

dotenv.config()

const discogsService = new DiscogsService()
const mainController = new MainController({ discogsService })

const app = express()

app.disable('x-powered-by')

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.get('/', mainController.getMain.bind(mainController))
app.post('/', mainController.postMain.bind(mainController))

// eslint-disable-next-line no-console
app.listen(process.env.PORT || 3000, () => console.log(`Listening on ${process.env.PORT || 3000}`))
