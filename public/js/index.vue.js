import { PostComponent } from "./components/PostComponent.js"
import { LoadComponent } from "./components/LoadComponent.js"
import { SideNavComponent } from "./components/SideNavComponent.js"

const userDefault = {
	id: null,
	nombre: '',
	email: '',
	usuario: '',
	avatar: ''
}

var vueApp = new Vue({
	el: "#app",

	components: {
		'post-component': PostComponent,
		'load-component': LoadComponent,
		'side-nav': SideNavComponent
	},

	data: {
		user: JSON.parse(JSON.stringify(userDefault)),

		posts: [],
		page: 1,
		limit: 10,
		loading: false,
		hasMorePosts: true
	},

	methods: {

		async obtenerUsuario() {
			const vm = this
			if (!userId) return

			const user = await getUser()
			if (user != null) Object.assign(vm.user, user)
		},

		async getPosts() {
			const vm = this
			if (!vm.hasMorePosts) return

			vm.loading = true

			fetch(`/photo/posts?page=${vm.page}&limit=${vm.limit}`)
				.then(res => res.json())
				.then(data => {
					vm.posts.push(...data)

					if (data.length === 0) {
						vm.hasMorePosts = false
					} else {
						vm.page++
					}
				})
				.catch(err => console.log(err))
				.finally(() => {
					vm.loading = false
				})
		},

		handleScroll() {
			const vm = this;
			const endOfList = vm.$refs.loadMore.offsetTop
			const scrollTop = window.scrollY + window.innerHeight

			if (!vm.loading && scrollTop > endOfList)
				vm.getPosts()

		},
	},


	mounted() {
		const vm = this
		vm.obtenerUsuario()
		vm.getPosts()

		window.addEventListener("scroll", vm.handleScroll)
	},

	beforeDestroy() {
		
	}
})