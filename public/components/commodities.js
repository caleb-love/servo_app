async function updateCommodityPrices() {

	const dateElement = document.getElementById('current-date')
	const wtiPriceElement = document.getElementById('wti-price')
	const brentPriceElement = document.getElementById('brent-price')
	const natgasPriceElement = document.getElementById('natgas-price')
  
	const date = new Date().toLocaleDateString()
	dateElement.textContent = `As of ${date}`
  
	try {
		const response = await fetch('/api/commodities')

		if (!response.ok) {
			throw new Error('Unable to fetch commodity prices')
		}

		const data = await response.json()
		console.log('API response data:', data)

		if (!data.data.success || !data.data.rates) {
			throw new Error('API response is unsuccessful or missing rates')
		}
  
	  const wtiPrice = (1 / data.data.rates.WTIOIL).toFixed(2)
	  wtiPriceElement.textContent = `$${wtiPrice} per barrel (USD)`
  
	  const brentPrice = (1 / data.data.rates.BRENTOIL).toFixed(2)
	  brentPriceElement.textContent = `$${brentPrice} per barrel (USD)`
  
	  const natgasPrice = (1 / data.data.rates.NG).toFixed(2)
	  natgasPriceElement.textContent = `$${natgasPrice} per MMBtu (USD)`
	} catch (error) {
	  console.error(error)
	}

}
  
updateCommodityPrices()
  