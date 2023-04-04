function initMap(stations) {
	if ('geolocation' in navigator) {
		navigator.geolocation.getCurrentPosition((position) => {
			const lat = position.coords.latitude
			const lng = position.coords.longitude

			const latElement = document.querySelector('.lat')
			const lngElement = document.querySelector('.lng')
			latElement.textContent = lat.toFixed(6)
			lngElement.textContent = lng.toFixed(6)

			const map = new google.maps.Map(document.getElementById('map'), {
				zoom: 13,
				minZoom: 10,
				center: { lat, lng },
			})

			const infoWindow = new google.maps.InfoWindow({
				content: '',
				disableAutoPan: true,
			})

			const currentLocationMarker = new google.maps.Marker({
				position: { lat, lng },
				map: map,
			})

			currentLocationMarker.addListener('click', () => {
				infoWindow.setContent(`Current Location: ${lat}, ${lng}`)
				infoWindow.open(map, currentLocationMarker)
			})

			const markers = stations.map((station) => {
				const icon = {
					url: station.logo,
					scaledSize: new google.maps.Size(50, 50),
					origin: new google.maps.Point(0, 0),
					anchor: new google.maps.Point(0, 0),
				}

				const marker = new google.maps.Marker({
					position: { lat: station.latitude, lng: station.longitude },
					icon,
					label: { text: station.name, fontWeight: 'bold' },
				})

				marker.addListener('click', () => {
					infoWindow.setContent(
						`<strong>${station.name}</strong><br/>${station.address}`
					)
					infoWindow.open(map, marker)
				})

				return marker
			})

			new markerClusterer.MarkerClusterer({ markers, map })

			map.addListener('center_changed', () => {
				const { lat, lng } = map.getCenter().toJSON()
				latElement.textContent = lat.toFixed(6)
				lngElement.textContent = lng.toFixed(6)
			})

			const	backButton = document.createElement('button')
					backButton.textContent = 'Current Location'
					backButton.classList.add('back-button')
					map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(backButton)

				backButton.addEventListener('click', () => {
					map.setCenter({ lat: lat, lng: lng })
					map.setZoom(13)
				})
		})
	} else {
		alert('Please enable location services to use this feature.')
	}
}

function fetchStations() {
	return axios.get('/api/station/all').then((res) => res.data)
}

fetchStations().then((window.initMap = initMap))

async function updatePetrolStationList() {
	try {
		const response = await axios.get('/api/station/all')
		const stations = response.data.slice(0, 10)
		const list = document.getElementById('petrol-stations-list')

		list.innerHTML = ''

		stations.forEach((station) => {
			const item = document.createElement('div')
			item.classList.add('station-item-right')
			item.innerHTML = `
		  <h2>${station.name}</h2>
		  <p>${station.address}</p>
		  <p>${station.owner}</p>
		`
			list.appendChild(item)
		})
	} catch (error) {
		console.error(error)
	}
}

updatePetrolStationList()

async function updateCommodityPrices() {
	const dateElement = document.getElementById('current-date')
	const wtiPriceElement = document.getElementById('wti-price')
	const brentPriceElement = document.getElementById('brent-price')
	const natgasPriceElement = document.getElementById('natgas-price')

	const date = new Date().toLocaleDateString()
	dateElement.textContent = `As of ${date}`

	try {
		const response = await fetch(
			`https://commodities-api.com/api/latest?access_key=${commoditiesApiKey}&base=USD&symbols=WTIOIL,BRENTOIL,NG`
		)

		if (!response.ok) {
			throw new Error('Unable to fetch commodity prices')
		}

		const data = await response.json()

		const wtiPrice = (1 / data.data.rates.WTIOIL).toFixed(2)
		wtiPriceElement.textContent = `$${wtiPrice} per barrel (USD)`

		const brentPrice = (1 / data.data.rates.BRENTOIL).toFixed(2)
		brentPriceElement.textContent = `$${brentPrice} per barrel (USD)`

		const natgasPrice = (1 / data.data.rates.NG).toFixed(2)
		natgasPriceElement.textContent = `$${natgasPrice} per MMBtu (USD)`
	} catch (error) {
		console.error(error)
	}
}

updateCommodityPrices()

const leftSidebar = document.querySelector('.left-sidebar')
const rightSidebar = document.querySelector('.right-sidebar')
const contentWrapper = document.querySelector('.content-wrapper')

document.addEventListener('keyup', doc_keyUp, false)
function doc_keyUp(e) {
	if (e.ctrlKey && e.keyCode == 66) {
		leftSidebar.classList.toggle('none')
		rightSidebar.classList.toggle('none')
		contentWrapper.classList.toggle('full-screen')
	}
}
