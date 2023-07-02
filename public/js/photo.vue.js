import { SideNavComponent } from "./components/SideNavComponent.js"
import { CommentComponent } from "./components/CommentComponent.js"

const socket = io(socketUrl)

var vueApp = new Vue({
	el: "#app",

	components: {
		'side-nav': SideNavComponent,
		'comment-component': CommentComponent
	},

	data: {
		photo,
		radioId: `rating-${photo.id}`,
		rating: photo.user_rating || null,
		user: photo.user,
		relativeTime: '',
		awaitingResponse: false,

		baseUrl,
		userId,

		showCollapseInterested: false,

		interested: photo.photo_interesteds,
		comments: photo.photo_comments,

		comentario: '',
		interesado: photo.user_interested,
	},

	methods: {
		getRelativeTime() {
			const createdDate = moment(this.photo.created_at)
			const formattedRelativeTime = createdDate.fromNow()
			this.relativeTime = formattedRelativeTime
		},

		sendComment() {
			const vm = this

			if (vm.comentario.trim() == '') return
			if (vm.awaitingResponse) return
			vm.awaitingResponse = true
			
			fetch(`/photo/${photo.id}/comment`, {
				method: 'POST',
				body: JSON.stringify({ comment: vm.comentario.trim() }),
				headers: {
					'Content-Type': 'application/json'
				}
			})
				.then(res => res.json())
				.then(data => {
					if (data.error) {
						showAlert('Commentario', data.errorMsg, 'error')
						return
					}
					vm.comentario = ''
					vm.comments.unshift(data.savedComment)
					socket.emit('send-comment', data.savedComment, photo.id)
				})
				.catch(err => {
					console.log(err)
				})
				.finally(() => vm.awaitingResponse = false)
		},
	},

	watch: {
		rating(newRating, oldRating) {
			const vm = this

			if (vm.awaitingResponse) return
			vm.awaitingResponse = true

			fetch(`/photo/${photo.id}/rating`, {
				method: 'POST',
				body: JSON.stringify({ rating: newRating }),
				headers: {
					'Content-Type': 'application/json'
				}
			})
				.then(res => res.json())
				.then(data => {
					if (data.error) {
						vm.rating = oldRating
						return
					}

					vm.rating = data.rating
					vm.photo.rating_average = data.average
				})
				.catch(err => {
					console.log(err)
					vm.rating = oldRating
				})
				.finally(() => vm.awaitingResponse = false)
		},

		interesado(newVal, oldVal) {
			const vm = this

			if (vm.awaitingResponse) return
			vm.awaitingResponse = true

			fetch(`/photo/${photo.id}/interested`, {
				method: 'POST',
				body: JSON.stringify({ interested: newVal }),
				headers: {
					'Content-Type': 'application/json'
				}
			})
				.then(res => res.json())
				.then(data => {
					if (data.error) {
						vm.interesado = oldVal
						return
					}
					vm.interesado = data.interested

					if (data.interested) {
						vm.interested.push(data.savedInterested)
					} else {
						vm.interested = vm.interested.filter(obj => obj.user_id != userId)
					}
					showAlert(
						'Interesado',
						data.interested ? 'Has mostrado interés' : 'Has quitado el interés',
						'success'
					)
				})
				.catch(err => {
					console.log(err)
					vm.interesado = oldVal
				})
				.finally(() => vm.awaitingResponse = false)
		}
	},

	mounted() {
		moment.locale('es')
		this.getRelativeTime()

		console.log(photo)

		// Socket listeners
		socket.emit('view-post', photo.id)
		socket.on('recieve-comment', comment => this.comments.unshift(comment))
	}
})