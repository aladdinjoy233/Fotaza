const { Server } = require('socket.io');
const { urls } = require('../config');

module.exports = http => {
	const io = new Server(http, {
		cors: {
			origin: [urls.baseUrl],
		}
	})

	io.on('connection', socket => {
		// console.log('User connected')

		socket.on('send-comment', (comment, photoId) => {
			if (!photoId) return
			socket.to(photoId).emit('recieve-comment', comment)
		})

		socket.on('view-post', photoId => socket.join(photoId))

		socket.on('disconnect', () => {
			// console.log('User disconnected')
		})
	})
}