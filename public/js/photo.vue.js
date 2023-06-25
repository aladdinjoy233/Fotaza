import { SideNavComponent } from "./components/SideNavComponent.js"

var vueApp = new Vue({
	el: "#app",

	components: {
		'side-nav': SideNavComponent
	},

	data: {
		photo,
		radioId: `rating-${photo.id}`,
		rating: photo.user_rating || null,
		user: photo.user,
		relativeTime: '',

		baseUrl,

		showCollapseInterested: false,

		interesados: [],
		comentarios: [],
	},

	methods: {
		getRelativeTime() {
			const createdDate = moment(this.photo.created_at)
			const formattedRelativeTime = createdDate.fromNow()
			this.relativeTime = formattedRelativeTime
		}
	},

	mounted() {
		console.log(photo)
		moment.locale('es')
		this.getRelativeTime()
	}
})