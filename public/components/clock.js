function formatTime(now) {
	const day = now.format('dddd')
	const time = now.format('HH:mm:ss')
	return `${day} ${time}`
}

function updateClock() {
	const now = dayjs()
	const formattedTime = formatTime(now)
	const clockElement = document.querySelector('.time')

	clockElement.textContent = formattedTime
}

setInterval(updateClock, 1000)
