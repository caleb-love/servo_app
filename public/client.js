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

		marker.addListener('click', () => {
			infoWindow.setContent(`<strong>$\qstations[i].name}</strong><br/>${stations[i].address}`)
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
