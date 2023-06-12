import { SideNavComponent } from "./components/SideNavComponent.js"

const userDefault = {
	id: null,
	nombre: '',
	email: '',
	usuario: '',
	avatar: ''
}

const photoDefault = {
	file_path: '',
	file: null,
	title: '',
	category_id: null,
	rights_id: null,
	is_private: false
}

var vueApp = new Vue({
	el: "#app",

	components: {
		'side-nav': SideNavComponent
	},

	data: {
		user: JSON.parse(JSON.stringify(userDefault)),
		categories: categories,
		rights: rights,

		photo: JSON.parse(JSON.stringify(photoDefault)),

		disablePrivate: false
	},

	methods: {

		async obtenerUsuario() {
			const vm = this
			if (!userId) return

			const user = await getUser()
			if (user != null) Object.assign(vm.user, user)
		},

		uploadImage(e) {
			const vm = this
			const file = e.target.files[0]

			if (!file) return

			const reader = new FileReader()
			reader.onload = event => {
				vm.photo.file_path = event.target.result
				vm.photo.file = file
			}
			reader.readAsDataURL(file)
		},

		validateForm() {
			const vm = this
			var err = false
			removeFormErrors('#create-photo-form')

			if (vm.photo.file == null || vm.photo.file_path == '') {
				showAlert('Error', 'Debe seleccionar una imagen', 'error')
				err = true
			}

			if (vm.photo.title == '') {
				formError('#title', 'Campo vacio')
				err = true
			}

			if (!vm.photo.category_id) {
				formError('#category_id', 'Falta elegir')
				err = true
			}

			if (!vm.photo.rights_id) {
				formError('#rights_id', 'Falta elegir')
				err = true
			}

			return err
		},

		submitForm() {
			const vm = this
			console.log(vm.photo)

			const err = vm.validateForm()
			if (err) return

			const photoData = {
				title: vm.photo.title,
				category_id: vm.photo.category_id,
				rights_id: vm.photo.rights_id,
				is_private: vm.photo.is_private,
				user_id: vm.user.id
			}

			const formData = new FormData()
			formData.append('photoData', JSON.stringify(photoData))
			formData.append('photo', vm.photo.file)

			fetch('/photo/post', {
				method: 'POST',
				body: formData
			})
				.then(res => res.redirected ? window.location.href = res.url : res.json())
				.then(data => {
					if (data.error) {
						showAlert('Error', data.errorMsg, 'error')
						return
					}

					window.location.href = '/'
				})
				.catch(err => console.log(err))
		}

	},

	watch: {
		'photo.rights_id'(newRightsId) {
			this.disablePrivate = false;
			const right = this.rights.find(r => r.id == newRightsId)

			if (right.rights_name == 'Copyright') {
				this.photo.is_private = true
				this.disablePrivate = true
			}
		}
	},

	mounted() {
		const vm = this
		vm.obtenerUsuario()
	},

});