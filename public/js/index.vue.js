import { PostComponent } from "./components/PostComponent.js"

var vueApp = new Vue({
	el: "#app",

	components: {
		'post-component': PostComponent
	},

	data: {
		posts: [],
		page: 1,
		limit: 10,
		loading: false
	},

	methods: {

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
			}, {
				id: Math.floor(Math.random() * 100),
				description: "This is a caption",
				imageSrc: "https://placedog.net/300/600",
				rating: 2,
				user: JSON.parse(localStorage.getItem("user")),
			}, {
				id: Math.floor(Math.random() * 100),
				description: "Práctica desde el lugar más lindo del planeta 🏟️💙💛💙",
				imageSrc: "https://placedog.net/700/300",
				tags: ['DaleBoca', 'Bombonera', 'Limpieza', 'Mantenimiento', 'VamosBoca', 'La12'],
				user: JSON.parse(localStorage.getItem("user")),
			}, {
				id: Math.floor(Math.random() * 100),
				description: "This is a caption",
				imageSrc: "https://placedog.net/700/700",
				user: JSON.parse(localStorage.getItem("user")),
			})

			vm.page++
			vm.loading = false
		},

		handleScroll() {
			const vm = this;
			// const endOfList = this.$refs.loadMore.offsetTop + this.$refs.loadMore.clientHeight
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
		vm.getPosts()

		window.addEventListener("scroll", vm.handleScroll)
	},

	beforeDestroy() {
		
	}
})