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

    const hoverWindow = new google.maps.InfoWindow({
		content: '',
		disableAutoPan: true,
	})

	const markers = stations.map((station, i) => {
        const icon = {
            url: station.logo,
            scaledSize: new google.maps.Size(50, 50),
            origin: new google.maps.Point(0,0), 
            anchor: new google.maps.Point(0, 0) 
        }
        
		const marker = new google.maps.Marker({
			position: { lat: station.latitude, lng: station.longitude },
			icon: icon,
		})
        // ? add station name as label to each marker. That appears when a user hover their mouse on top of the marker
        // marker.addListener('mouseover', () => {
        //     hoverWindow.setContent(`<p>${stations[i].name}</p>`)
        //     hoverWindow.open(map, marker)
        // });

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
  
