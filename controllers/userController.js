const User = require('../database/models/User')

exports.get = async (req, res, next) => {
	const userId = req.params.userId

	const user = await User.findByPk(userId, {
		attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
	})

	res.status(200).json(user)
}