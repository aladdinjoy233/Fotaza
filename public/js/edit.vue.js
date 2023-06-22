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
		'side-nav': SideNavComponent
	},

	data: {
		user: JSON.parse(JSON.stringify(userDefault)),
		photo,
		categories,
		rights,

		tagText: '',
		tags: [],
		maxTagsCount: 3,

		disablePrivate: false,

		showModal: false
	},

	methods: {

		async obtenerUsuario() {
			const vm = this
			if (!userId) return

			const user = await getUser()
			if (user != null) Object.assign(vm.user, user)
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

		validateForm() {
			const vm = this
			var err = false
			removeFormErrors('#edit-photo-form')

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
			if (vm.validateForm()) return

			let tags = vm.tags.slice(0, 3)
			tags = tags.map(tag => tag = tag.replace(/^#+/, ''))

			const photoData = {
				photo_id: vm.photo.id,
				user_id: vm.user.id,
				title: vm.photo.title,
				category_id: vm.photo.category_id,
				rights_id: vm.photo.rights_id,
				is_private: vm.photo.is_private,
				tags: tags,
			}

			fetch('/photo/edit', {
				method: 'POST',
				body: JSON.stringify(photoData),
				headers: {
					'Content-Type': 'application/json'
				}
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
		},

		deletePhoto() {
			const vm = this
			if (!vm.photo.id) return

			fetch('/photo/delete', {
				method: 'POST',
				body: JSON.stringify({ photo_id: vm.photo.id }),
				headers: {
					'Content-Type': 'application/json'
				}
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
				.finally(() => vm.showModal = false)
		},
		
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

		vm.tags = tags.map(tag => `#${tag.tag_name}`)

		vm.$refs.tagInput.addEventListener('keydown', e => {
			if (e.keyCode == 13) {
				e.preventDefault()
				vm.addTag()
			}
		})

		window.onclick = e => {
			if (e.target == vm.$refs.deleteModal) vm.showModal = false
		}
	}
})