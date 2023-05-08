const User = require('../database/models/User')

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

	// console.log(req.user)

	res.render('edit-profile', { title: 'Editar | Fotaza', scripts: ['editProfile'] })
}