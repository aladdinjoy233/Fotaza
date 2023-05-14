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

				<a href="#" class="btn btn-link side-nav__item" :class="{ 'selected': selected == 'home' }" key="home">
					<i class="fa-solid fa-house"></i> Home
				</a>
				<a href="#" class="btn btn-link side-nav__item" :class="{ 'selected': selected == 'tags' }" key="tags">
					<i class="fa-solid fa-hashtag"></i> Tags
				</a>
				<a href="#" class="btn btn-link side-nav__item" :class="{ 'selected': selected == 'crear' }" key="crear">
					<i class="fa-solid fa-circle-plus"></i> Crear
				</a>

			</div>
		</div>
	`,
	data() {
		return {
		}
	},
	methods: {
	},
	computed: {
	},
	mounted() {
	}
};