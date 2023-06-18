import { PostComponent } from "./components/PostComponent.js"
import { LoadComponent } from "./components/LoadComponent.js"

var vueApp = new Vue({
	el: "#app",

	components: {
		'post-component': PostComponent,
		'load-component': LoadComponent,
	},

	data: {
		user,
		posts: [],
		loading: false,
	},

	methods: {

		async getPosts() {
			const vm = this
			vm.loading = true

			fetch(`/photo/posts/${user.id}`)
				.then(res => res.json())
				.then(data => {
					vm.posts.push(...data)
					vm.loading = false
				})
				.catch(err => console.log(err))
		},

	},

	mounted() {
		const vm = this
		vm.getPosts()
	}
})