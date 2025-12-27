import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import publicCars from './routes/publicCars'
import { tenantResolver } from './middleware/tenant'

const app = express()
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '5mb' }))
app.use(morgan('dev'))

app.get('/health', (req, res) => res.json({ ok: true }))

// Public routes prefixed by tenant slug
app.use('/t/:slug/public/cars', tenantResolver, publicCars)

// Simple OpenAPI file
app.get('/openapi.json', (req, res) => res.sendFile(__dirname + '/../openapi.json'))

export default app
