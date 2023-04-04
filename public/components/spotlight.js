function getRandomStation() {
	fetch('/api/station/random')
		.then((response) => response.json())
		.then((stations) => {
			const spotlightStation = document.querySelector('#station-info')
			spotlightStation.innerHTML = `<p>Name: ${stations.owner}</p><p>Location: ${stations.address}</p>`
		})
}

document.addEventListener('DOMContentLoaded', getRandomStation);