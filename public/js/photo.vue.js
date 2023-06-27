import { SideNavComponent } from "./components/SideNavComponent.js"
import { CommentComponent } from "./components/CommentComponent.js"

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

		interested: [],
		comments: photo.photo_comments,

		comentario: '',
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
		}
	},

	mounted() {
		console.log(photo)
		moment.locale('es')
		this.getRelativeTime()
	}
})