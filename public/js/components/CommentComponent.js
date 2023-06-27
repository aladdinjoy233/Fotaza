export const CommentComponent = {
	props: {
		comment: {
			type: Object,
			required: true
		},
	},
	template: `
		<div class="comment">
			<div class="comment__header">
				<a class="comment__header-profile" :href="'${baseUrl}/profile/' + comment.user.usuario">
					<img class="comment__header-avatar" :src="comment.user.avatar || '/img/user.svg'" alt="">
				</a>
			</div>
			<div class="comment__body">
				<p>
					<a class="btn btn-link comment__body-profile" :href="'${baseUrl}/profile/' + comment.user.usuario">{{ comment.user.nombre }}</a>
					{{ comment.comment }}
				</p>
				<p class="comment__body-date">{{ relativeTime }}</p>
			</div>
		</div>
	`,
	data() {
		return {
			relativeTime: '',
		}
	},
	methods: {
		updateRelativeTime() {
			const createdDate = moment(this.comment.created_at)
			const formattedRelativeTime = createdDate.fromNow()
			this.relativeTime = formattedRelativeTime
		}
	},
	mounted() {
		moment.locale('es')
		this.updateRelativeTime()
	}
};