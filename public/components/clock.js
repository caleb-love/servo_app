function updateClock() {
	const now = dayjs()

	const day = now.format('dddd')
	const time = now.format('HH:mm:ss')

	const clockElement = document.querySelector('.time')
	clockElement.textContent = `${day} ${time}`
}

setInterval(updateClock, 1000)
