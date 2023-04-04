function initMap(stations) {
	const map = new google.maps.Map(document.getElementById('map'), {
		zoom: 13,
        minZoom: 10,
		center: { lat: -33.8712, lng: 151.2046 }, // set to GA location for now
	})
	const infoWindow = new google.maps.InfoWindow({
		content: '',
		disableAutoPan: true,
	})

	const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    // * change marker to have image icon https://developers.google.com/maps/documentation/javascript/examples/icon-simple

	const markers = stations.map((station, i) => {
		const label = labels[i % labels.length]
		const marker = new google.maps.Marker({
			position: { lat: station.latitude, lng: station.longitude },
			label,
		})

        marker.addListener('mouseover', () => {
            infoWindow.setContent(`<p>${stations[i].name}</p>`)
            infoWindow.open(map, marker)
        })

        marker.addListener('mouseout', () => {
            infoWindow.close()
        })

		marker.addListener('click', () => {
			infoWindow.setContent(`<strong>${stations[i].name}</strong><br/>${stations[i].address}`)
			infoWindow.open(map, marker)
		})
		return marker
	})

	new markerClusterer.MarkerClusterer({ markers, map })
}

function fetchStations() {
    return axios.get("/api/station/all").then(res => res.data) 
}

fetchStations().then(window.initMap = initMap)

async function updatePetrolStationList() {

	try {
	  const response = await axios.get('/api/station/all')
	  const stations = response.data.slice(0, 10)
	  const list = document.getElementById('petrol-stations-list')
  
	  
	  list.innerHTML = ''
  
	 
	  stations.forEach(station => {
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

	const apiKey = 'insert api key'
	
  
	try {
	  const response = await fetch(
		`https://commodities-api.com/api/latest?access_key=${apiKey}&base=USD&symbols=WTIOIL,BRENTOIL,NG`,
	  )
  
	  if (!response.ok) {
		throw new Error('Unable to fetch commodity prices')
	  }
  
	  const data = await response.json()
  
	  const wtiPrice = data.data.rates.WTIOIL.toFixed(2)
	  wtiPriceElement.textContent = `$${wtiPrice}`
  
	  const brentPrice = data.data.rates.BRENTOIL.toFixed(2)
	  brentPriceElement.textContent = `$${brentPrice}`
  
	  const natgasPrice = data.data.rates.NG.toFixed(2)
	  natgasPriceElement.textContent = `$${natgasPrice}`
	} catch (error) {
	  console.error(error)
	}

}

updateCommodityPrices()
