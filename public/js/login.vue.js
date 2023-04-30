import { TestComponent } from "./components/TestComponent.js"

var app = new Vue({
	el: "#app",

	components: {
		'test-component': TestComponent
	},

	data: {
		loginDetails: {
			email: '',
			password: ''
		},

		signupDetails: {
			email: '',
			password: '',
			confirmPassword: ''
		},

		loginActive: false,
		loginInputTypePassword: true,
		signupInputTypePassword: true,
	},

	methods: {
		getHash() {
			const vm = this
			let hash = window.location.hash.replace('#', '')

			// Si no tiene hash, le asigno el valor por defecto (login)
			const hashesArr = ['login', 'signup']
			if (!hashesArr.includes(hash)) {
				window.location.hash = 'login'
				hash = 'login'
			}

			// Setear el titulo de la pagina
			document.title = hash == 'login' ? 'Login' : 'Signup'
			vm.loginActive = hash == 'login'
		},

		loginToggle() {
			this.loginActive = true
			window.location.hash = 'login'
		},

		signupToggle() {
			this.loginActive = false
			window.location.hash = 'signup'
		},

		validateLogin() {
			const vm = this
			let err = false
			removeFormErrors('#login-form')

			if (vm.loginDetails.email == '') {
				formError('#email-login', 'Campo vacio')
				err = true
			}

			if (vm.loginDetails.password == '') {
				formError('#pass-login', 'Campo vacio')
				err = true
			}

			return err
		},

		validateSignup() {
			const vm = this
			let err = false
			removeFormErrors('#signup-form')

			if (vm.signupDetails.email == '') {
				formError('#email-signup', 'Campo vacio')
				err = true
			}

			if (vm.signupDetails.password == '') {
				formError('#pass-signup', 'Campo vacio')
				err = true
			}

			if (vm.signupDetails.confirmPassword == '') {
				formError('#pass-confirm-signup', 'Campo vacio')
				err = true
			}

			if (vm.signupDetails.password != vm.signupDetails.confirmPassword) {
				formError('#pass-confirm-signup', 'Las contraseñas no coinciden')
				err = true
			}

			return err			
		},

		submitForm(login = false) {
			const vm = this

			const err = login ? vm.validateLogin() : vm.validateSignup()
			if (err) return

			const userData = login ? vm.loginDetails : vm.signupDetails
			const url = login ? '/auth/login' : '/auth/signup'
			const stringMethod = login ? "Log-in" : "Sign-up"

			fetch(url, {
				method: 'POST',
				body: JSON.stringify(userData),
				headers: {
					'Content-Type': 'application/json'
				}
			})
				.then(res => res.redirected ? window.location.href = res.url : res.json())
				.then(data => {
					if (data.error) {
						showAlert(stringMethod, data.errorMsg, 'error')
					}
				})
				.catch(err => console.log(err))
		},
	},

	mounted() {
		const vm = this
		vm.getHash()
		window.addEventListener('hashchange', vm.getHash)
	}
})