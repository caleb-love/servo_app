import { fetchStations, fetchStationsInBound } from '../servo_api.js'

let map
let markers

const latElement = document.querySelector('.lat')
const lngElement = document.querySelector('.lng')
const locElement = document.querySelector('.map-loc')
const leftSidebar = document.querySelector('.left-sidebar')
const rightSidebar = document.querySelector('.right-sidebar')
const contentWrapper = document.querySelector('.content-wrapper')
const spotlightStation = document.querySelector('#station-info')
const refreshLink = document.querySelector('#refresh-link')
const legend = document.getElementById('legend')

const icons = {
    current: {
        name: 'Current Location',
        icon: '/images/marker.png',
    },
    caltex: {
      name: 'Caltex',
      icon: '/images/Caltex.png',
    },
    bp: {
      name: 'BP',
      icon: '/images/BP.png',
    },
    shell: {
      name: 'Shell',
      icon: '/images/Shell.png',
    },
    sevenEleven: {
        name: '7-Eleven Pty Ltd',
        icon: '/images/7Eleven.png',
    },
    united: {
        name: 'United', 
        icon: '/images/United.jpg',
    },
    other: {
        name: 'Other', 
        icon: '/images/petrol.png',
    }
}

async function initMap() {
    const { Map } = await google.maps.importLibrary('maps')
    
	if ('geolocation' in navigator) {
		navigator.geolocation.getCurrentPosition((position) => {
			const lat = position.coords.latitude
			const lng = position.coords.longitude

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

			markers = [currentLocationMarker]

			currentLocationMarker.addListener('click', () => {
				infoWindow.setContent(`Current Location: ${lat}, ${lng}`)
				infoWindow.open(map, currentLocationMarker)
			})

			function updateLocationInfo() {
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
							locElement.textContent = 'Do better Caleb'
						}
					}
				)
			}

			google.maps.event.addListenerOnce(map, 'idle', () => {
				updateLocationInfo()
				updatePetrolStationList(lat, lng, 5)
			})

			map.addListener('mouseup', updateLocationInfo)

			map.addListener('idle', () => {
				const northEast = map.getBounds().getNorthEast()
				const southWest = map.getBounds().getSouthWest()
				const southLat = southWest.lat()
				const northLat = northEast.lat()
				const westLng = southWest.lng()
				const eastLng = northEast.lng()

				fetchStationsInBound(southLat, northLat, westLng, eastLng)
					.then((res) => {
						setMapOnAll(null)
						markers = [currentLocationMarker]

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
							markers.push(marker)

							marker.addListener('click', () => {
								infoWindow.setContent(
									`<strong>${station.name}</strong><br/>${station.address}`
								)
								infoWindow.open(map, marker)
							})

							marker.addListener('mouseover', () => {
								marker.set("label", {
								text: station.name,
								fontWeight: 'bold',
								className: 'labels'
								})
							})

							marker.addListener('mouseout', () => {
								marker.set('label', '')
							})
						})
					})
					.then((res) => {
						setMapOnAll(map)
						// console.log(markers)
					})
			})

			const backButton = document.createElement('button')
			backButton.textContent = 'Current Location'
			backButton.classList.add('back-button')
			map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(backButton)

			backButton.addEventListener('click', () => {
				map.setCenter({ lat: lat, lng: lng })
				map.setZoom(13)
			})

			for (const key in icons) {
			  const type = icons[key]
			  const name = type.name
			  const icon = type.icon
			  const div = document.createElement('div')
		  
			  div.innerHTML = '<img src="' + icon + '"> ' + name
			  legend.appendChild(div)
			}
		  
			map.controls[google.maps.ControlPosition.LEFT_TOP].push(legend)
		})

	} else {
		alert('Please enable location services to use this feature.')
	}
}

function setMapOnAll(map) {
	for (let i = 0; i < markers.length; i++) {
		markers[i].setMap(map)
	}
}

async function updatePetrolStationList(lat, lng, radius) {
	try {
		const response = await axios.get(
			`/api/stations/nearest?latitude=${lat}&longitude=${lng}&radius=${radius}`
		)
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

function getRandomStation() {
	fetch('/api/station/random')
	  .then(response => response.json())
	  .then(({ name, owner, latitude, longitude, address, suburb, state, logo }) => {
        let spotlightMarker

		spotlightStation.innerHTML = `
            <p>Name: <strong>${name}</strong></p>
            <p>Owner: ${owner} </p>
            <p>Location: ${address}, ${suburb}, ${state}</p>
        `

        map.setCenter({ lat: latitude, lng: longitude })
        
		spotlightMarker = new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map,
            icon: {
                url: logo,
                scaledSize: new google.maps.Size(50, 50),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(0, 0),
            }
		})

		const infoWindow = new google.maps.InfoWindow({
		  content: `<strong>${name}</strong><br/>${address}`,
		})
		infoWindow.open(map, spotlightMarker)

    })
}

function doc_keyUp(e) {
	if (e.ctrlKey && e.keyCode == 66) {
		leftSidebar.classList.toggle('none')
		rightSidebar.classList.toggle('none')
		contentWrapper.classList.toggle('full-screen')
	}
}

initMap()

document.addEventListener('DOMContentLoaded', () => {
	getRandomStation()
})

refreshLink.addEventListener('click', (event) => {
    event.preventDefault()
    getRandomStation()
})

document.addEventListener('keyup', doc_keyUp, false)