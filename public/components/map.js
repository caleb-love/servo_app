import { fetchStationsInBound, fetchRandom } from '../servo_api.js'
import { updatePetrolStationList } from './nearest_list.js'

let map
let markers

const latElement = document.querySelector('.lat')
const lngElement = document.querySelector('.lng')
const locElement = document.querySelector('.map-loc')
const leftSidebar = document.querySelector('.left-sidebar')
const rightSidebar = document.querySelector('.right-sidebar')
const contentWrapper = document.querySelector('.content-wrapper')
const spotlightStation = document.querySelector('#station-info')
const spotlight_section = document.querySelector('.spotlight-section')
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
	},
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

			currentLocationMarker.addListener('mouseover', () => {
				currentLocationMarker.set('label', {
					text: 'Current Location',
					fontWeight: 'bold',
					className: 'labels',
				})
			})

			currentLocationMarker.addListener('mouseout', () => {
				currentLocationMarker.set('label', '')
			})

			// currentLocationMarker.addListener('click', () => {
			// infoWindow.setContent(`Current Location: ${lat}, ${lng}`)
			// infoWindow.open(map, currentLocationMarker)
			// })

			currentLocationMarker.setAnimation(google.maps.Animation.BOUNCE)

			currentLocationMarker.addListener('click', () => {
				if (currentLocationMarker.getAnimation() !== null) {
					currentLocationMarker.setAnimation(null)
				} else {
					currentLocationMarker.setAnimation(
						google.maps.Animation.BOUNCE
					)
				}
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

			let updateTimeout
			map.addListener('idle', () => {
				clearTimeout(updateTimeout)
				updateTimeout = setTimeout(() => {
					const { lat, lng } = map.getCenter().toJSON()
					updatePetrolStationList(lat, lng, 5)
				}, 500)
			})

			let displayedStations = []

			map.addListener('idle', () => {
				const northEast = map.getBounds().getNorthEast()
				const southWest = map.getBounds().getSouthWest()
				const southLat = southWest.lat()
				const northLat = northEast.lat()
				const westLng = southWest.lng()
				const eastLng = northEast.lng()

				fetchStationsInBound(southLat, northLat, westLng, eastLng)
					.then((res) => {
						res.forEach((station) => {
							if (
								!displayedStations.some(
									(s) => s.id === station.id
								)
							) {
								const icon = {
									url: station.logo,
									scaledSize: new google.maps.Size(50, 50),
									origin: new google.maps.Point(0, 0),
									anchor: new google.maps.Point(0, 0),
								}

								const marker = new google.maps.Marker({
									position: {
										lat: station.latitude,
										lng: station.longitude,
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
									marker.set('label', {
										text: station.name,
										fontWeight: 'bold',
										className: 'labels',
									})
								})

								marker.addListener('mouseout', () => {
									marker.set('label', '')
								})

								displayedStations.push({
									id: station.id,
									marker,
								})
							}
						})
					})
					.then((res) => {
						displayedStations.forEach((station) => {
							if (
								!map
									.getBounds()
									.contains(station.marker.getPosition())
							) {
								station.marker.setMap(null)

								const index = displayedStations.indexOf(station)
								if (index > -1) {
									displayedStations.splice(index, 1)
								}
							}
						})
					})
			})

			const backButton = document.createElement('button')
			backButton.textContent = 'Current Location'
			backButton.classList.add('back-button')
			map.controls[google.maps.ControlPosition.LEFT_TOP].push(
				backButton
			)

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

function getRandomStation() {
	fetchRandom().then(
		({
			name,
			owner,
			latitude,
			longitude,
			address,
			suburb,
			state,
			logo,
		}) => {
			let spotlightMarker
			spotlight_section.querySelector('img').src = logo

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
				},
			})

			const infoWindow = new google.maps.InfoWindow({
				content: `<strong>${name}</strong><br/>${address}`,
			})
			infoWindow.open(map, spotlightMarker)

			latElement.textContent = latitude
			lngElement.textContent = longitude
			locElement.textContent = `${address}, ${suburb}, ${state}`
		}
	)
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

const darkModeToggle = document.querySelector('#dark-mode-toggle')
const mapElement = document.querySelector('#map')
darkModeToggle.addEventListener('click', () => {
	document.body.classList.toggle('dark-mode')
	if (document.body.classList.contains('dark-mode')) {
		mapElement.classList.add('dark-mode-map')
		map.setOptions({
			styles: [
				{
					featureType: 'all',
					elementType: 'all',
					stylers: [
						{
							visibility: 'on',
						},
					],
				},
				{
					featureType: 'all',
					elementType: 'labels',
					stylers: [
						{
							visibility: 'off',
						},
						{
							saturation: '-100',
						},
					],
				},
				{
					featureType: 'all',
					elementType: 'labels.text.fill',
					stylers: [
						{
							saturation: 36,
						},
						{
							color: '#000000',
						},
						{
							lightness: 40,
						},
						{
							visibility: 'off',
						},
					],
				},
				{
					featureType: 'all',
					elementType: 'labels.text.stroke',
					stylers: [
						{
							visibility: 'off',
						},
						{
							color: '#000000',
						},
						{
							lightness: 16,
						},
					],
				},
				{
					featureType: 'all',
					elementType: 'labels.icon',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
				{
					featureType: 'administrative',
					elementType: 'geometry.fill',
					stylers: [
						{
							color: '#000000',
						},
						{
							lightness: 20,
						},
					],
				},
				{
					featureType: 'administrative',
					elementType: 'geometry.stroke',
					stylers: [
						{
							color: '#000000',
						},
						{
							lightness: 17,
						},
						{
							weight: 1.2,
						},
					],
				},
				{
					featureType: 'landscape',
					elementType: 'geometry',
					stylers: [
						{
							color: '#000000',
						},
						{
							lightness: 20,
						},
					],
				},
				{
					featureType: 'landscape',
					elementType: 'geometry.fill',
					stylers: [
						{
							color: '#4d6059',
						},
					],
				},
				{
					featureType: 'landscape',
					elementType: 'geometry.stroke',
					stylers: [
						{
							color: '#4d6059',
						},
					],
				},
				{
					featureType: 'landscape.natural',
					elementType: 'geometry.fill',
					stylers: [
						{
							color: '#4d6059',
						},
					],
				},
				{
					featureType: 'poi',
					elementType: 'geometry',
					stylers: [
						{
							lightness: 21,
						},
					],
				},
				{
					featureType: 'poi',
					elementType: 'geometry.fill',
					stylers: [
						{
							color: '#4d6059',
						},
					],
				},
				{
					featureType: 'poi',
					elementType: 'geometry.stroke',
					stylers: [
						{
							color: '#4d6059',
						},
					],
				},
				{
					featureType: 'road',
					elementType: 'geometry',
					stylers: [
						{
							visibility: 'on',
						},
						{
							color: '#7f8d89',
						},
					],
				},
				{
					featureType: 'road',
					elementType: 'geometry.fill',
					stylers: [
						{
							color: '#7f8d89',
						},
					],
				},
				{
					featureType: 'road.highway',
					elementType: 'geometry.fill',
					stylers: [
						{
							color: '#7f8d89',
						},
						{
							lightness: 17,
						},
					],
				},
				{
					featureType: 'road.highway',
					elementType: 'geometry.stroke',
					stylers: [
						{
							color: '#7f8d89',
						},
						{
							lightness: 29,
						},
						{
							weight: 0.2,
						},
					],
				},
				{
					featureType: 'road.arterial',
					elementType: 'geometry',
					stylers: [
						{
							color: '#000000',
						},
						{
							lightness: 18,
						},
					],
				},
				{
					featureType: 'road.arterial',
					elementType: 'geometry.fill',
					stylers: [
						{
							color: '#7f8d89',
						},
					],
				},
				{
					featureType: 'road.arterial',
					elementType: 'geometry.stroke',
					stylers: [
						{
							color: '#7f8d89',
						},
					],
				},
				{
					featureType: 'road.local',
					elementType: 'geometry',
					stylers: [
						{
							color: '#000000',
						},
						{
							lightness: 16,
						},
					],
				},
				{
					featureType: 'road.local',
					elementType: 'geometry.fill',
					stylers: [
						{
							color: '#7f8d89',
						},
					],
				},
				{
					featureType: 'road.local',
					elementType: 'geometry.stroke',
					stylers: [
						{
							color: '#7f8d89',
						},
					],
				},
				{
					featureType: 'transit',
					elementType: 'geometry',
					stylers: [
						{
							color: '#000000',
						},
						{
							lightness: 19,
						},
					],
				},
				{
					featureType: 'water',
					elementType: 'all',
					stylers: [
						{
							color: '#2b3638',
						},
						{
							visibility: 'on',
						},
					],
				},
				{
					featureType: 'water',
					elementType: 'geometry',
					stylers: [
						{
							color: '#2b3638',
						},
						{
							lightness: 17,
						},
					],
				},
				{
					featureType: 'water',
					elementType: 'geometry.fill',
					stylers: [
						{
							color: '#24282b',
						},
					],
				},
				{
					featureType: 'water',
					elementType: 'geometry.stroke',
					stylers: [
						{
							color: '#24282b',
						},
					],
				},
				{
					featureType: 'water',
					elementType: 'labels',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
				{
					featureType: 'water',
					elementType: 'labels.text',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
				{
					featureType: 'water',
					elementType: 'labels.text.fill',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
				{
					featureType: 'water',
					elementType: 'labels.text.stroke',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
				{
					featureType: 'water',
					elementType: 'labels.icon',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
			],
		})
	} else {
		mapElement.classList.remove('dark-mode-map')
		map.setOptions({ styles: null })
	}
})

const epilepsyModeToggle = document.querySelector('#epilepsy-mode-toggle');
let epilepsyModeInterval;
let originalBackgroundColor = document.body.style.background;
epilepsyModeToggle.addEventListener('click', () => {
  if (epilepsyModeInterval) {
    clearInterval(epilepsyModeInterval);
    epilepsyModeInterval = null;
    document.body.style.background = originalBackgroundColor;
    map.setOptions({ styles: null });
  } else {
    epilepsyModeInterval = setInterval(() => {
      if (document.body.style.background === 'yellow') {
        document.body.style.background = 'red';
      } else {
        document.body.style.background = 'yellow';
      }
      mapElement.classList.toggle('epilepsy-mode-map');
      map.setOptions({
        styles: [
          {
            featureType: "all",
            elementType: "all",
            stylers: [
              { invert_lightness: true },
              { saturation: -100 }
            ]
          }
        ]
      });
    }, 100);
  }
});