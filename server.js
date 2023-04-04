const express = require('express')
const app = express()
const config = require('./config')
const expressLayouts = require('express-ejs-layouts')
const db = require('./db')

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(expressLayouts)
app.use(express.urlencoded({ extended: true }))

app.use(require('./middlewares/method_override'))
app.use(express.json()) // json for body maybe not required ??
const Station = require('./models/stations')

app.get('/', (req, res) => {
	res.render('index', { googleApiKey: config.googleApiKey })
})

app.get('/api/station/all', (req, res) => {
	Station.findAll().then((dbRes) => res.json(dbRes))
})

app.get('/api/owners', (req, res) => {
	Station.total_stations().then((owners) => res.json(owners))
})

app.get('/api/stats', (req, res) => {
	Station.stats().then((stats) => res.json(stats))
})

app.get('/api/station/random', (req, res) => {
	Station.random_station()
		.then((random) => res.json(random))
})

app.listen(config.port, () => {
	console.log(`listening on port ${config.port}`)
})
