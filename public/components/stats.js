
const stats_list = document.querySelector('.stats-list')
const total_stations = document.querySelector('.total-stations')
const total_owners = document.querySelector('.total-owners')
// stats_list.style.backgroundColor = 'red'

let ownerStats 
axios.get('/api/stats')
.then(( res) => {
	total_owners.textContent = res.data.total_owners
	total_stations.textContent = res.data.total_stations
	ownerStats = res.data.owners.slice(0,7)
	stats_list.innerHTML = ownerStats
		.map( (owner, i)=> {
			return renderStats(owner , i)
		})
		.join('')	
})	



function renderStats(owner , i){
	if ( i % 2 == 0 ){
		return`
			<li>
				<div style="background-color: #ffe4c4;" class="station-item">
		    		<span>${owner.owner}</span>
					<span>${owner.count}</span>
				</div>
			</li>
		`
	} else {
		return`
			<li>
				<div class="station-item">
		    		<span>${owner.owner}</span>
					<span>${owner.count}</span>
				</div>
			</li>
		`
	}
}	
