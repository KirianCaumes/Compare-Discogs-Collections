import express from 'express'
import dotenv from 'dotenv'
import { DefaultController } from 'controllers'
import { DiscogsService } from 'services'

dotenv.config()

const discogsService = new DiscogsService()
const defaultController = new DefaultController({ discogsService })

const app = express()

app.disable('x-powered-by')

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.get('/', defaultController.getDefault.bind(defaultController))
app.post('/', defaultController.postDefault.bind(defaultController))

// eslint-disable-next-line no-console
app.listen(process.env.PORT || 3000, () => console.log(`Listening on ${process.env.PORT || 3000}`))
