var vueApp = new Vue({
	el: "#app",

	data: {

		inputTypePassword: true,

		user: {
			id: user.id,
			email: user.email,
			avatar: {
				url: user.avatar,
				file: null
			},
			usuario: user.usuario,
			nombre: user.nombre,
		},

		details: {
			password: "",
			confirmPassword: "",
		},

		showCollapsePassword: false,

	},

	methods: {

		uploadImage(e) {
			const vm = this
			const file = e.target.files[0]

			if (!file) return

			const reader = new FileReader()
			reader.onload = event => {
				vm.user.avatar.url = event.target.result
				vm.user.avatar.file = file
			}
			reader.readAsDataURL(file)
		},

		resetAvatar() {
			const vm = this
			vm.user.avatar = { url: '', file: null }
			const fileInput = document.querySelector('#avatar');
			fileInput.value = ''
		},

		async validateForm() {
			const vm = this
			var err = false
			removeFormErrors('#edit-user-form')

			if (vm.user.nombre == '') {
				formError('#nombre', 'Campo vacio')
				err = true
			}

			if (vm.user.usuario == '') {
				formError('#usuario', 'Campo vacio')
				err = true
			}

			vm.user.usuario = vm.user.usuario.trim()
			if (vm.user.usuario.indexOf(' ') >= 0) {
				formError('#usuario', 'No puede contener espacios')
				err = true
			}

			// Mas que nada por las rutas
			const usernameRegex = /^[a-zA-Z0-9_-]+$/
			if (!usernameRegex.test(vm.user.usuario)) {
				formError('#usuario', 'No puede contener caracteres especiales')
				err = true
			}

			// Para el editar, asi no se confunde la ruta
			if (vm.user.usuario.toLowerCase() == 'edit') {
				formError('#usuario', 'Usuario no permitido')
				err = true
			}

			// Verificar que el usuario ingresado no este en uso
			const res = await fetch(`/user/checkAvailable/`,{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ usuario: vm.user.usuario, id: vm.user.id })
			})
			const available = (await res.json()).available

			if (!available) {
				formError('#usuario', 'Usuario no disponible')
				showAlert('Usuario', 'Ese usuario ya se encuentra en uso.', 'error')
				err = true
			}

			if (vm.details.password == '' && vm.details.confirmPassword == '')
				return err

			// Checkeo de la modificacion de una contraseña
			if (vm.details.password == '' && vm.details.confirmPassword != '') {
				formError('#pass', 'Contraseña vacia')
				err = true
				return err
			}

			if (vm.details.password != '' && vm.details.confirmPassword == '') {
				formError('#pass-confirm', 'Confirmacion vacio')
				err = true
				return err
			}

			if (vm.details.password != vm.details.confirmPassword) {
				formError('#pass-confirm', 'Las contraseñas no coinciden')
				err = true
			}

			return err
		},

		async submitForm() {
			const vm = this

			const err = await vm.validateForm()
			if (err) return

			const formData = new FormData()
			formData.append('usuario', JSON.stringify(vm.user))
			formData.append('password', JSON.stringify({
				password: vm.details.password,
				confirmPassword: vm.details.confirmPassword
			}))

			if (vm.user.avatar.file) {
				formData.append('avatar', vm.user.avatar.file)
			} else {
				formData.append('avatar', vm.user.avatar.url)
			}

			fetch('/user/edit', {
				method: 'POST',
				body: formData
			})
				.then(res => res.json())
				.then(data => {
					if (data.error) {
						showAlert('Edición de usuario', data.errorMsg, 'error')
						return
					}

					try {
						localStorage.setItem('user', JSON.stringify(data.user))
					} catch (err) {
						console.log('Error con el localStorage: ', err)
					}

					window.location.href = '/'
				})
				.catch(err => console.log(err))
		},

	},

	mounted() {
		const vm = this
	}
})