

function getRandomStation() {
	fetch('/api/station/random')
		.then((response) => response.json())
		.then((stations) => {
			const spotlightStation = document.querySelector('#station-info')
			spotlightStation.innerHTML = `<p>Name: ${stations.name}</p><p>Location: ${stations.address}</p>`

			const spotlight_right =document.querySelector('.spotlight-right')
			const img = spotlight_right.querySelector('img')
			img.src=stations.logo
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
