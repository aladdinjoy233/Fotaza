export const PostComponent = {
	props: {
		post: {
			type: Object,
			required: true
		}
	},
	template: `
		<div class="post">
			<div class="post-header">

				<div class="post-left">
					<a class="post-header__profile" :href="'${baseUrl}/profile/' + user.usuario">
						<img class="post-header__avatar" :src="user.avatar || '/img/user.svg'" alt="">
						<span>{{ user.nombre }}</span>
					</a>
					<span class="post-header__date">
						<span class="post-header__separator">•</span>{{ relativeTime }}
					</span>
				</div>

				<div class="post-right" v-if="userId == post.user_id">
					<a :href="'${baseUrl}/photo/edit/' + post.id" class="btn btn-link">
						<i class="fa-solid fa-pencil"></i>
					</a>
				</div>

			</div>

			<a :href="'${baseUrl}/photo/' + post.id" class="post-image">
				<img :src="post.file_path" alt="Post Image">
			</a>

			<div class="post-actions" v-if="userId">

				<div class="d-flex">
					<form class="post-actions__rating">
						<p>
							<input type="radio" :id="radioId + '-1'" name="rating" value="5" v-model="rating">
							<label :for="radioId + '-1'">★</label>
							<input type="radio" :id="radioId + '-2'" name="rating" value="4" v-model="rating">
							<label :for="radioId + '-2'">★</label>
							<input type="radio" :id="radioId + '-3'" name="rating" value="3" v-model="rating">
							<label :for="radioId + '-3'">★</label>
							<input type="radio" :id="radioId + '-4'" name="rating" value="2" v-model="rating">
							<label :for="radioId + '-4'">★</label>
							<input type="radio" :id="radioId + '-5'" name="rating" value="1" v-model="rating">
							<label :for="radioId + '-5'">★</label>
						</p>
					</form>
					<div class="post-actions__rating-average">{{ post.rating_average ? post.rating_average + ' (promedio)' : '' }}</div>
				</div>

				<div class="post-actions__interested" v-if="userId != post.user_id">
					<button class="btn btn-link" :class="{ 'interested': interesado }" @click="interesado = !interesado"><i class="fa-solid fa-cart-shopping"></i></button>
				</div>

			</div>

			<div class="post-details">
				<p>{{ post.title }}</p>
				<div class="post-details__tags">
					<a :href="'${baseUrl}/search?q=' + tag.tag_name" class="tag" v-for="tag in post.tags">#{{ tag.tag_name }}</a>
				</div>
			</div>

			<div class="post-footer">
				<a :href="'${baseUrl}/photo/' + post.id" class="post-footer__comments">Ver comentarios</a>
			</div>
		</div>
	`,
	data() {
		return {
			user: this.post.user,
			userId,
			radioId: `rating-${this.post.id}`,
			rating: this.post.user_rating || null,
			relativeTime: '',
			loggedUser: null,
			interesado: this.post.user_interested,

			awaitingResponse: false
		}
	},
	methods: {

		async obtenerUsuario() {
			const vm = this
			if (!userId) return

			const user = await getUser()
			if (user != null) vm.loggedUser = user
		},

		getRelativeTime() {
			const createdDate = moment(this.post.created_at)
			const formattedRelativeTime = createdDate.fromNow()
			this.relativeTime = formattedRelativeTime
		}

	},
	computed: {
	},
	watch: {
		rating(newRating, oldRating) {
			const vm = this

			if (vm.awaitingResponse) return
			vm.awaitingResponse = true

			fetch(`/photo/${vm.post.id}/rating`, {
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
					vm.post.rating_average = data.average
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

			fetch(`/photo/${vm.post.id}/interested`, {
				method: 'POST',
				body: JSON.stringify({ interested: newVal }),
				headers: {
					'Content-Type': 'application/json'
				}
			})
				.then(res => res.json())
				.then(async data => {
					if (data.error) {
						vm.interesado = oldVal
						return
					}
					vm.interesado = data.interested

					if (data.interested) {
						if (vm.loggedUser == null) await vm.obtenerUsuario()
						socket.emit('send-interest', vm.user.id, vm.loggedUser.nombre, vm.post.id)
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
	}
};