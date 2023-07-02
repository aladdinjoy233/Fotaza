const { Server } = require('socket.io');
const { urls } = require('../config');

module.exports = http => {
	const io = new Server(http, {
		cors: {
			origin: [urls.baseUrl],
		}
	})

	io.on('connection', socket => {
		console.log('User connected')

		socket.on('send-comment', (comment, photoId) => {
			if (!photoId) return
			socket.to(photoId).emit('recieve-comment', comment)
		})

		socket.on('view-post', photoId => socket.join(photoId))

		socket.on('send-interest', (targetUserId, interestedName, photoId) => {
			if (!targetUserId) return
			socket.to(targetUserId).emit('recieve-notif', `${interestedName} esta interesado en tu foto!`, 'Haga click para ver la foto...', `${baseUrl}/photo/${photoId}`)
		})

		socket.on('on-site', userId => socket.join(userId))

		socket.on('disconnect', () => {
			// console.log('User disconnected')
		})
	})
}