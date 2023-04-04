function getRandomStation() {
	fetch('/api/station/random')
		.then((response) => response.json())
		.then((station) => {
			const stationInfo = document.querySelector('#station-info')
			stationInfo.innerHTML = `<p>Name: ${station.name}</p><p>Location: ${station.location}</p>`
		})
}
