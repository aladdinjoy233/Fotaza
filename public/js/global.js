// Obtener datos sencillos del usuario.
// Se guardan en el localStorage para evitar hacer multiplos
// fetch en cada recarga de la pagina
function getUser() {
	const cachedUserData = localStorage.getItem('user');

	// Si existe los datos en el cache, devuelve los datos
	if (cachedUserData) {
		const user = JSON.parse(cachedUserData);
		if (user.id == userId) {
			return user;
		}

		localStorage.removeItem('user');
	}
	
	// Si no existe en el cache, busca los datos
	if (!userId) return null;
	return fetch(`/user/get/${userId}`)
	.then(res => res.json())
	.then(data => {
		try {
			localStorage.setItem('user', JSON.stringify(data));
		} catch (err) {
			console.log('Error con el localStorage: ', err);
		}
		return data
	})
	.catch(err => {
		console.log(err)
		return null
	});
}

// Agregar error a un input
function formError(element, message) {
	const elem = document.querySelector(element)
	elem.classList.add('is-invalid')

	const newElem = document.createElement('div')
	newElem.classList.add('invalid-feedback')
	newElem.innerHTML = message

	elem.after(newElem)

	// Una ves se agrega un error, se elimina cuando el usuario escribe
	const fun = () => {
		elem.classList.remove('is-invalid')
		const invalidFeedback = document.querySelector(`${element} ~ .invalid-feedback`)
		if (invalidFeedback) invalidFeedback.remove()
		elem.removeEventListener('input', fun)
	}

	elem.addEventListener('input', fun)
}

// Sacar los errores de todos los inputs en un formulario
function removeFormErrors(formElem) {
	const form = document.querySelector(formElem)
	form.querySelectorAll('input').forEach(input => input.classList.remove('is-invalid'))
	form.querySelectorAll('.invalid-feedback').forEach(div => div.remove())
}

// Alert function
function showAlert(title, message, type = 'info') {
	// Asignar el tipo de alert info por defecto si no esta en la lista
	const alertTypes = ['error', 'success', 'info']
	if (!alertTypes.includes(type)) type = 'info'

	const alert = document.createElement('div')
	document.body.appendChild(alert)

	alert.classList.add('alert', `alert-${type}`)
	alert.innerHTML = `
	<h3>${title}</h3>
	<p>${message}</p>
	`

	const seconds = 4; // Facil para cambiarle la duracion del alert en segundos
	const timeInMiliSeconds = seconds * 1000

	setTimeout(() => alert.classList.add('slide-out'), timeInMiliSeconds); // animacion de salida de la alerta
	setTimeout(() => alert.remove(), timeInMiliSeconds + 1250); // se va del DOM
}