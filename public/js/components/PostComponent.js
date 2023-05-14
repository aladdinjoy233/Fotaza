export const PostComponent = {
	props: {
		post: {
			type: Object,
			required: true
		},
	},
	template: `
		<div class="post">
			<div class="post-header">
				<a class="post-header__profile">
					<img class="post-header__avatar" :src="user.avatar || '/img/user.svg'" alt="">
					<span>{{ user.nombre }}</span>
				</a>
			</div>

			<a href="#" class="post-image">
				<img :src="post.imageSrc" alt="Post Image">
			</a>

			<div class="post-actions">
				<form class="post-actions__rating">
					<p>
						<input type="radio" :id="radioId + '-1'" name="rating" value="5" v-model="localRating">
						<label :for="radioId + '-1'">★</label>
						<input type="radio" :id="radioId + '-2'" name="rating" value="4" v-model="localRating">
						<label :for="radioId + '-2'">★</label>
						<input type="radio" :id="radioId + '-3'" name="rating" value="3" v-model="localRating">
						<label :for="radioId + '-3'">★</label>
						<input type="radio" :id="radioId + '-4'" name="rating" value="2" v-model="localRating">
						<label :for="radioId + '-4'">★</label>
						<input type="radio" :id="radioId + '-5'" name="rating" value="1" v-model="localRating">
						<label :for="radioId + '-5'">★</label>
					</p>
				</form>
				<div>{{ localRating }}</div>
			</div>

			<div class="post-details">
				<p>{{ post.description }}</p>
				<div class="post-details__tags">
					<span class="tag" v-for="tag in post.tags">#{{ tag }}</span>
				</div>
			</div>

			<div class="post-footer">
				<a href="#" class="post-footer__comments">Ver comentarios</a>
			</div>
		</div>
	`,
	data() {
		return {
			user: this.post.user,
			radioId: `rating-${this.post.id}`,
			localRating: this.post.rating
		}
	},
	methods: {
	},
	computed: {
	},
	mounted() {
	}
};