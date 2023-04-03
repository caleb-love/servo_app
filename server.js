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
app.use(express.json()) // json

app.get('/', (req, res) => {
	res.render('index', { googleApiKey: config.googleApiKey })
})

app.get('/api/station/all', (req, res ) => {
	
	const sql = "select * from stations limit 400;"
	return db.query(sql)
	.then( dbRes => {
		
		res.json(dbRes.rows)})

})



app.listen(config.port, () => {
	console.log(`listening on port ${config.port}`)
})
