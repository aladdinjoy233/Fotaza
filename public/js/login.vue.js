import { TestComponent } from "./components/TestComponent.js"

var app = new Vue({
	el: "#app",

	components: {
		'test-component': TestComponent
	},

	data: {
		email: '',
		password: '',
	},

	methods: {
		submitForm(login = false) {
			const vm = this

			const userData = { email: vm.email, password: vm.password }
			const fetchURL = login ? '/auth/login' : '/auth/signup'

			fetch(fetchURL, {
				method: 'POST',
				body: JSON.stringify(userData),
				headers: {
					'Content-Type': 'application/json'
				}
			})
				.then(res => res.json())
				.then(data => console.log(data))

		},
	},

	mounted() {
	}
})