const express = require('express')
const app = express()
const config = require('./config')
const Station = require('./models/stations')
const axios = require('axios')

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))



app.get('/', (req, res) => {
	res.render('index', {
		googleApiKey: config.googleApiKey,
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

app.get('/api/stations/nearest', (req, res) => {

	const latitude = parseFloat(req.query.latitude)
	const longitude = parseFloat(req.query.longitude)
	const radius = parseFloat(req.query.radius)
	const limit = 700

	Station.nearest_station( latitude , longitude , radius , limit )
	.then((results) => res.json(results))
	
})

app.get('/api/commodities', async (req, res) => {

	try {
	  const response = await axios.get(`https://commodities-api.com/api/latest?access_key=${process.env.COMMODITIES_API_KEY}&base=USD&symbols=WTIOIL,BRENTOIL,NG`)
	  res.json(response.data)
	  
	} catch (error) {
	  console.error(error)
	  res.status(500).json({ error: 'An error occurred while fetching commodity data' })
	}

})
  

app.listen(config.port, () => {
	console.log(`listening on port ${config.port}`)
})
