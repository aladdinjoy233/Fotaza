import { TestComponent } from "./components/TestComponent.js"

var vueApp = new Vue({
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
			confirmPassword: '',
			avatar: {
				url: '',
				file: null
			},
			usuario: '',
			nombre: '',
		},

		loginActive: false,
		loginInputTypePassword: true,
		signupInputTypePassword: true,

		signupStep: 1,
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

		validateSignupSecondStep() {
			const vm = this
			let err = false
			removeFormErrors('#signup-form')

			if (vm.signupDetails.usuario == '') {
				formError('#usuario', 'Campo vacio')
				err = true
			}

			vm.signupDetails.usuario = vm.signupDetails.usuario.trim()
			if (vm.signupDetails.usuario.indexOf(' ') >= 0) {
				formError('#usuario', 'No puede contener espacios')
				err = true
			}

			// Mas que nada por las rutas
			const usernameRegex = /^[a-zA-Z0-9_-]+$/
			if (!usernameRegex.test(vm.signupDetails.usuario)) {
				formError('#usuario', 'No puede contener caracteres especiales')
				err = true
			}

			// Para el editar, asi no se confunde la ruta
			if (vm.signupDetails.usuario.toLowerCase() == 'edit') {
				formError('#usuario', 'Usuario no permitido')
				err = true
			}

			if (vm.signupDetails.nombre == '') {
				formError('#nombre', 'Campo vacio')
				err = true
			}

			return err			
		},

		continueSignup() {
			const vm = this
			const err = vm.validateSignup()
			if (err) return
			vm.signupStep++
		},

		uploadImage(e) {
			const vm = this
			const file = e.target.files[0]

			if (!file) return

			const reader = new FileReader()
			reader.onload = event => {
				vm.signupDetails.avatar.url = event.target.result
				vm.signupDetails.avatar.file = file
			}
			reader.readAsDataURL(file)
		},

		resetAvatar() {
			const vm = this
			vm.signupDetails.avatar = { url: '', file: null }
			const fileInput = document.querySelector('#avatar');
			fileInput.value = ''
		},

		submitForm(login = false) {
			const vm = this

			let err
			if (login) {
				err = vm.validateLogin()
			} else {
				const validStepOne = vm.validateSignup();
				const validStepTwo = vm.validateSignupSecondStep();
				err = validStepOne || validStepTwo
			}
			if (err) return

			let formData;
			if (!login) {
				formData = new FormData();
				formData.append('usuario', vm.signupDetails.usuario)
				formData.append('nombre', vm.signupDetails.nombre)
				formData.append('email', vm.signupDetails.email)
				formData.append('password', vm.signupDetails.password)
				formData.append('confirmPassword', vm.signupDetails.confirmPassword)
				formData.append('avatar', vm.signupDetails.avatar.file)
			}

			const body = login ? JSON.stringify(vm.loginDetails) : formData
			const url = login ? '/auth/login' : '/auth/signup'
			const stringMethod = login ? "Log-in" : "Sign-up"
			const headers = login ? { 'Content-Type': 'application/json' } : { }

			fetch(url, {
				method: 'POST',
				body,
				headers
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