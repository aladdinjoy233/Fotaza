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
		query,
		user: JSON.parse(JSON.stringify(userDefault)),

		posts: [],
		page: 1,
		limit: 10,
		loading: false,
		hasMorePosts: true,
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

			fetch(`/photo/search?q=${vm.query}&page=${vm.page}&limit=${vm.limit}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			})
				.then(res => res.json())
				.then(data => {
					if (data.error) {
						showAlert('Publicaciones', data.errorMsg, 'error')
						return
					}

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

		newSearch() {
			const vm = this
			vm.posts = []
			vm.page = 1
			vm.limit = 10
			vm.loading = false
			vm.hasMorePosts = true

			// Setear los parametros en la URL
			const url = new URL(window.location.href)
			const searchParams = new URLSearchParams(url.search)
			searchParams.set('q', vm.query)
			url.search = searchParams.toString()
			history.pushState(null, null, url.href)

			vm.getPosts()
		},
	},


	mounted() {
		const vm = this
		vm.obtenerUsuario()
		vm.getPosts()

		window.addEventListener("scroll", vm.handleScroll)
	},
})