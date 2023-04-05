import { fetchStations, fetchStationsInBound } from './servo_api.js'

let map

async function initMap() {
	const { Map } = await google.maps.importLibrary('maps')

	if ('geolocation' in navigator) {
		navigator.geolocation.getCurrentPosition((position) => {
			const lat = position.coords.latitude
			const lng = position.coords.longitude

			const latElement = document.querySelector('.lat')
			const lngElement = document.querySelector('.lng')
			const locElement = document.querySelector('.map-loc')
			latElement.textContent = lat.toFixed(6)
			lngElement.textContent = lng.toFixed(6)

			const geocoder = new google.maps.Geocoder()

			map = new Map(document.getElementById('map'), {
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

			map.addListener('center_changed', async () => {

				const { lat, lng } = map.getCenter().toJSON()
				latElement.textContent = lat.toFixed(6)
				lngElement.textContent = lng.toFixed(6)


			  
				geocoder.geocode(
				  { location: { lat, lng } },
				  (results, status) => {
					if (status === 'OK') {
					  if (results[0]) {
						locElement.textContent =
						  results[0].formatted_address
					  } else {
						locElement.textContent = 'Address not found'
					  }
					} else {
					  locElement.textContent =
						'Geocoder failed due to: ' + status
					}
				  }
				)
			  
			await updatePetrolStationList(lat, lng, 5)



			})

			map.addListener('bounds_changed', () => {
				const northEast = map.getBounds().getNorthEast()
				const southWest = map.getBounds().getSouthWest()
				const southLat = southWest.lat()
				const northLat = northEast.lat()
				const westLng = southWest.lng()
				const eastLng = northEast.lng()

				fetchStationsInBound(southLat, northLat, westLng, eastLng).then(
					(res) =>
						res.forEach((station) => {
							const icon = {
								url: station.logo,
								scaledSize: new google.maps.Size(50, 50),
								origin: new google.maps.Point(0, 0),
								anchor: new google.maps.Point(0, 0),
							}

							const marker = new google.maps.Marker({
								position: {
									lat: Number(station.latitude),
									lng: Number(station.longitude),
								},
								map,
								icon,
								label: '',
							})
							// console.log(marker)

							marker.addListener('click', () => {
								infoWindow.setContent(
									`<strong>${station.name}</strong><br/>${station.address}`
								)
								infoWindow.open(map, marker)
							})

							marker.addListener('mouseover', () => {
								marker.set('label', {
									text: station.name,
									fontWeight: 'bold',
								})
							})

							marker.addListener('mouseout', () => {
								marker.set('label', '')
							})
						})
				)
			})

			const backButton = document.createElement('button')
			backButton.textContent = 'Current Location'
			backButton.classList.add('back-button')
			map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(
				backButton
			)

			backButton.addEventListener('click', () => {
				map.setCenter({ lat: lat, lng: lng })
				map.setZoom(13)
			})
		})
	} else {
		alert('Please enable location services to use this feature.')
	}
}

initMap()



async function updatePetrolStationList(lat, lng, radius) {


	try {
	  const response = await axios.get(
		`/api/stations/nearest?latitude=${lat}&longitude=${lng}&radius=${radius}`
	  )
	  const stations = response.data.slice(0, 10)
	  const list = document.getElementById("petrol-stations-list")
  
	  list.innerHTML = ""
  
	  stations.forEach((station) => {
		const item = document.createElement("div")
		item.classList.add("station-item-right")
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
