const express = require('express')
const app = express()
const config = require('./config')
const db = require('./db')
const Station = require('./models/stations')

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(require('./middlewares/method_override'))
app.use(express.json())

app.get('/', (req, res) => {
	res.render('index', {
		googleApiKey: config.googleApiKey,
		commoditiesApiKey: process.env.COMMODITIES_API_KEY,
	})
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
	Station.random_station().then((random) => res.json(random))
})

app.get('/api/station/bounds', (req, res) => {
	const { south, north, west, east } = req.query
	Station.in_bounds(south, north, west, east).then((stations) =>
		res.json(stations)
	)
})

app.get('/api/stations/nearest', async (req, res) => {
	const latitude = parseFloat(req.query.latitude)
	const longitude = parseFloat(req.query.longitude)
	const radius = parseFloat(req.query.radius)
	const limit = 700

	const query = `
    SELECT *, 
      (6371 * acos(
        cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude))
      )) AS distance
    FROM stations
    WHERE 
      (6371 * acos(
        cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude))
      )) <= $3
    ORDER BY distance
    LIMIT $4;
  `

	try {
		const result = await db.query(query, [
			latitude,
			longitude,
			radius,
			limit,
		])
		res.json(result.rows)
	} catch (error) {
		console.error(error)
		res.status(500).json({
			error: 'An error occurred while fetching nearest stations',
		})
	}
})

app.listen(config.port, () => {
	console.log(`listening on port ${config.port}`)
})
