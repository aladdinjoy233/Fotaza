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
		loading: false
	},

	methods: {

		async obtenerUsuario() {
			const vm = this
			if (!userId) return

			const user = await getUser()
			if (user != null) Object.assign(vm.user, user)
		},

		timeout(ms) { return new Promise(resolve => setTimeout(resolve, ms)) },

		async getPosts() {
			const vm = this
			vm.loading = true

			await this.timeout(2000)

			vm.posts.push({
				id: Math.floor(Math.random() * 100),
				description: "This is a caption",
				imageSrc: "https://placedog.net/400/400",
				rating: 2,
				user: JSON.parse(localStorage.getItem("user")),
				numberOfComments: 1
			}, {
				id: Math.floor(Math.random() * 100),
				description: "This is a caption",
				imageSrc: "https://placedog.net/300/600",
				rating: 2,
				user: JSON.parse(localStorage.getItem("user")),
				numberOfComments: 0
			}, {
				id: Math.floor(Math.random() * 100),
				description: "Práctica desde el lugar más lindo del planeta 🏟️💙💛💙",
				imageSrc: "https://placedog.net/700/300",
				tags: ['DaleBoca', 'Bombonera', 'Limpieza', 'Mantenimiento', 'VamosBoca', 'La12'],
				user: JSON.parse(localStorage.getItem("user")),
				numberOfComments: 15
			}, {
				id: Math.floor(Math.random() * 100),
				description: "This is a caption",
				imageSrc: "https://placedog.net/700/700",
				user: JSON.parse(localStorage.getItem("user")),
				numberOfComments: 3
			})

			vm.page++
			vm.loading = false
		},

		handleScroll() {
			const vm = this;
			const endOfList = vm.$refs.loadMore.offsetTop
			const scrollTop = window.scrollY + window.innerHeight

			if (!vm.loading && scrollTop > endOfList) {
				vm.page++
				vm.getPosts()
				vm.loading = true
			}

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