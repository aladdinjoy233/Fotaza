import { TestComponent } from "./components/TestComponent.js";

var app = new Vue({
	el: "#app",

	components: {
		'test-component': TestComponent
	},

	data: {
		test: 'heya'
	},

	mounted() {
		console.log('HEY!')
	}
})