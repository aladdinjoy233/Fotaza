export const SideNavComponent = {
	props: {
		selected: {
			type: String,
			required: false
		}
	},
	template: `
		<div class="side-nav">
			<div class="side-nav__list">

				<a href="${baseUrl}" class="btn btn-link side-nav__item" :class="{ 'selected': selected == 'home' }" key="home">
					<i class="fa-solid fa-house"></i> Portada
				</a>
				<a href="${baseUrl}" class="btn btn-link side-nav__item" :class="{ 'selected': selected == 'destacado' }" key="destacado">
					<i class="fa-solid fa-star"></i> Destacado
				</a>
				<a href="${baseUrl}/photo/" class="btn btn-link side-nav__item" :class="{ 'selected': selected == 'crear' }" key="crear">
					<i class="fa-solid fa-circle-plus"></i> Crear
				</a>

			</div>
		</div>
	`,

	data() {
		return {
			baseUrl: baseUrl
		}
	},
	methods: {
	},
	computed: {
	},
	mounted() {
	}
};