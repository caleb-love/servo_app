// function getRandomStation() {
// 	fetch('/api/station/random')
// 		.then((response) => response.json())
// 		.then((stations) => {
// 			const spotlightStation = document.querySelector('#station-info')
// 			spotlightStation.innerHTML = `<p>Name: ${stations.owner}</p><p>Location: ${stations.address}</p>`
// 		})
// }

// document.addEventListener('DOMContentLoaded', () => {
// 	getRandomStation()

// 	const refreshLink = document.querySelector('#refresh-link')
// 	refreshLink.addEventListener('click', (event) => {
// 		event.preventDefault()
// 		getRandomStation()
// 	})
// })


function getRandomStation() {
    fetch('/api/station/random')
        .then((response) => response.json())
        .then((station) => {
            const spotlightStation = document.querySelector('#station-info')
            const nameLink = document.createElement('a')
            nameLink.innerText = station.owner
            nameLink.href = '#'
            nameLink.addEventListener('click', () => {
                const map = new google.maps.Map(document.getElementById('map'), {
                    center: { lat: station.latitude, lng: station.longitude },
                    zoom: 16,
                })
                const marker = new google.maps.Marker({
                    position: { lat: station.latitude, lng: station.longitude },
                    map,
                })
                const infoWindow = new google.maps.InfoWindow({
                    content: `<p>Name: ${station.owner}</p><p>Location: ${station.address}</p>`,
                })
                infoWindow.open(map, marker)
            })
            spotlightStation.innerHTML = `<p>Name: </p>`
            spotlightStation.firstChild.appendChild(nameLink)
            spotlightStation.innerHTML += `<p>Location: ${station.address}</p>`
        })
}

document.addEventListener('DOMContentLoaded', () => {
    getRandomStation()

    const refreshLink = document.querySelector('#refresh-link')
    refreshLink.addEventListener('click', (event) => {
        event.preventDefault()
        getRandomStation()
    })
})
