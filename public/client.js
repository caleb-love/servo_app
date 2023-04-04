const lat = document.querySelector('.lat')
const lng = document.querySelector('.lng')
const mapLoc = document.querySelector('.map-loc')

function initMap(stations) {
	const map = new google.maps.Map(document.getElementById('map'), {
		zoom: 13,
		minZoom: 10,
		center: { lat: -33.8712, lng: 151.2046 },
	})
	const infoWindow = new google.maps.InfoWindow({
		content: '',
		disableAutoPan: true,
	})

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const pos = {
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					}

					infoWindow.setPosition(pos)
					infoWindow.setContent('Location found.')
					infoWindow.open(map)
					map.setCenter(pos)
				},
				() => {
					handleLocationError(true, infoWindow, map.getCenter())
				}
			)
		} else {
			handleLocationError(false, infoWindow, map.getCenter())
		}

	const markers = stations.map((station, i) => {
		const icon = {
			url: station.logo,
			scaledSize: new google.maps.Size(50, 50),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(0, 0),
		}

		// function setLatLng(){
		// 	lat.textContent =
		// }

		const marker = new google.maps.Marker({
			position: { lat: station.latitude, lng: station.longitude },
			icon: icon,
		})
		// ? add station name as label to each marker. That appears when a user hover their mouse on top of the marker

		// marker.addListener('mouseover', () => {
		//     infoWindow.setContent(`<p>${stations[i].name}</p>`)
		//     infoWindow.open(map, marker)
		// })

		// marker.addListener('mouseout', () => {
		//     infoWindow.close()
		// })

		map.addListener('center_changed', () => {
			lat.textContent = map.getCenter().toJSON().lat
			lng.textContent = map.getCenter().toJSON().lng
		})

		marker.addListener('click', () => {
			infoWindow.setContent(
				`<strong>${stations[i].name}</strong><br/>${stations[i].address}`
			)
			infoWindow.open(map, marker)
		})
		return marker
	})

	new markerClusterer.MarkerClusterer({ markers, map })
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

document.addEventListener('keyup', doc_keyUp, false);
function doc_keyUp(e) {
	if (e.ctrlKey && e.keyCode == 66) {
		leftSidebar.classList.toggle('none')
		rightSidebar.classList.toggle('none')
		contentWrapper.classList.toggle('full-screen')
	}
}

// to handle user location error
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
	infoWindow.setPosition(pos)
	infoWindow.setContent(
		browserHasGeolocation
			? 'Error: The Geolocation service failed.'
			: "Error: Your browser doesn't support geolocation."
	)
	infoWindow.open(map)
}

window.initMap = initMap
