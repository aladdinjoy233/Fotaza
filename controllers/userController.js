const User = require('../database/models/User')
const bcrypt = require('bcrypt')

const { uploadAvatar, updateAvatar, deleteAvatar } = require('../firebase/firebase')

exports.get = async (req, res, next) => {
	const userId = req.params.userId

	const user = await User.findByPk(userId, {
		attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
	})

	res.status(200).json(user)
}

exports.userProfile = async (req, res, next) => {
	const usuario = req.params.slug;

	const user = await User.findOne({
		where: { usuario },
		attributes: { exclude: ['password', 'updatedAt'] }
	})

	// Si no hay usuario (o no existe), redirigir al inicio
	if (!user || !usuario)
		return res.redirect('/')

	let isOwnAccount = false

	if (res.locals.userId && res.locals.userId == user.id)
		isOwnAccount = true

	res.render('profile', { title: `${user.nombre} | Fotaza`, scripts: ['profile'], user, isOwnAccount })
}

exports.editProfile = async (req, res, next) => {
	if (!req.user) return res.redirect('/')

	const user = {
		id: req.user.id,
		avatar: req.user.avatar,
		nombre: req.user.nombre,
		usuario: req.user.usuario,
		email: req.user.email,
	}

	res.render('edit-profile', { title: 'Editar | Fotaza', scripts: ['editProfile'], user })
}

exports.checkAvailable = async (req, res, next) => {
	const { usuario, id } = req.body;

	if (!usuario || !id) return res.status(400)

	const dbUser = await User.findOne({
		where: { usuario },
		attributes: { exclude: ['password', 'updatedAt'] },
	})

	if (!dbUser) return res.status(200).json({ available: true })
	if (dbUser && dbUser.id != id) return res.status(200).json({ available: false })
	return res.status(200).json({ available: true })
}

exports.edit = async (req, res, next) => {
	if (!req.body.usuario) return res.status(400)

	// Obtener los datos del formulario de edicion
	var { id, usuario, nombre, email, avatar } = JSON.parse(req.body.usuario);
	const { password, confirmPassword } = JSON.parse(req.body.password);

	const originalUser = await User.findByPk(id)

	// Verificar los datos del formulario
	if (!id || !usuario || !nombre || !email)
		return res.status(400).json({ error: true, errorMsg: 'Faltan datos' })

	// Verificar que el usuario no tenga espacios
	usuario = usuario.trim()
	if (usuario.indexOf(' ') >= 0)
		return res.status(400).json({ error: true, errorMsg: 'Usuario no puede contener espacios' })

	// Verificar que el usuario no tenga caracteres especiales
	const usernameRegex = /^[a-zA-Z0-9_-]+$/
	if (!usernameRegex.test(usuario))
		return res.status(400).json({ error: true, errorMsg: 'Usuario no puede contener caracteres especiales' })

	// Verificar que el usuario no sea edit
	if (req.body.usuario.toLowerCase() == 'edit')
		return res.status(400).json({ error: true, errorMsg: 'Nombre usuario no permitido' })

	// Buscar que el usuario no este en uso
	const usuarioCheck = await User.findOne({ where: { usuario } })
	if (usuarioCheck && usuarioCheck.id != id)
		return res.status(400).json({ error: true, errorMsg: 'El usuario ya está en uso' })

	// Verificar las contraseñas
	if ((password || confirmPassword) && password != confirmPassword)
		return res.status(400).json({ error: true, errorMsg: 'Las contraseñas no coinciden' })

	// Editar el usuario
	var updatedUser = await User.findByPk(id)
	updatedUser = await updatedUser.update({ usuario, nombre, email })

	if (password) {
		const passHash = await bcrypt.hash(password, 8)
		updatedUser = await updatedUser.update({ password: passHash })
	}

	// Si borran al avatar, borrarlo de la BD
	if (!avatar.url && originalUser.avatar) {
		const isDeleted = await deleteAvatar(originalUser.avatar)
		if (isDeleted) updatedUser = await updatedUser.update({ avatar: null })
	}

	// Si suben un avatar, guardarlo en la BD
	if (req.file) {

		if (originalUser.avatar) {
			const avatarUrl = await updateAvatar(id, req.file, originalUser.avatar)
			if (avatarUrl) updatedUser = await updatedUser.update({ avatar: avatarUrl })
		} else {
			const avatarUrl = await uploadAvatar(id, req.file)
			updatedUser = await updatedUser.update({ avatar: avatarUrl })
		}

	}

	const newUser = await User.findByPk(id, {
		attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
	})

	return res.status(200).json({ user: newUser })
}