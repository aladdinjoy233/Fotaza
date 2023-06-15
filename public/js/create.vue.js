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

		disablePrivate: false,
		tagText: '',
		tags: [],
		maxTagsCount: 3,

		showCollapseWatermark: false,
		watermark: '',
		watermarkTipo: 'ninguna'
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

		addTag() {
			const vm = this

			let tag = vm.tagText.trim()
			if (tag == '') return
			if (vm.tags.length >= vm.maxTagsCount) {
				showAlert('Etiquetas', `Máximo de ${vm.maxTagsCount} tags`, 'info')
				return
			}
			tag = tag.replace(/^#+/, '')
			tag = `#${tag}`

			vm.tags.push(tag)
			vm.tagText = ''
		},

		removeTag(index) {
			const vm = this
			vm.tags.splice(index, 1)
		},

		configureWatermark() {
			const vm = this
			let watermark = '';

			if (vm.watermarkTipo == 'ninguna' && !vm.photo.is_private) {
				watermark = `Fotaza @${vm.user.usuario}`
			}

			if (vm.watermarkTipo == 'fotaza') {
				watermark = `Fotaza @${vm.user.usuario}`
			}

			if (vm.watermarkTipo == 'usuario') {
				watermark = `@${vm.user.usuario}`
			}

			if (vm.watermarkTipo == 'personalizable') {
				watermark = vm.watermark
			}

			return watermark
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
			const err = vm.validateForm()
			if (err) return

			let tags = vm.tags.slice(0, 3)
			tags = tags.map(tag => tag = tag.replace(/^#+/, ''))

			const watermark = vm.configureWatermark()

			const photoData = {
				title: vm.photo.title,
				category_id: vm.photo.category_id,
				rights_id: vm.photo.rights_id,
				is_private: vm.photo.is_private,
				user_id: vm.user.id,
				tags,
				watermark
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

		vm.$refs.tagInput.addEventListener('keydown', e => {
			if (e.keyCode == 13) {
				e.preventDefault()
				vm.addTag()
			}
		})

	},

});