export async function updatePetrolStationList(lat, lng, radius) {
	try {
		const response = await axios.get(
			`/api/stations/nearest?latitude=${lat}&longitude=${lng}&radius=${radius}`
		)
		const stations = response.data.slice(0, 10)
		const list = document.getElementById('petrol-stations-list')

		list.innerHTML = ''

		stations.map((station , i ) => {
			const item = document.createElement('div')
			item.classList.add('station-item-right')
            if  ( i % 2 == 0 ){ 
                item.style.backgroundColor = '#ffe4c4'
            }
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

