export function fetchStations() {
	return axios.get('/api/station/all').then((res) => res.data)
}