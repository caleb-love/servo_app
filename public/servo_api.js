export function fetchStations() {
	return axios.get('/api/station/all').then((res) => res.data)
}

export function fetchStationsInBound(southLat, northLat, westLng, eastLng) {
    return axios.get(`/api/station/bounds?south=${southLat}&north=${northLat}&west=${westLng}&east=${eastLng}`)
        .then(res => res.data)
}

export function fetchRandom() {
    return axios.get('/api/station/random').then((res) => res.data)
}