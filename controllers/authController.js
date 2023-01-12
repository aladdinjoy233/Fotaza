const jwt = require('jsonwebtoken');
var User = require('../database/models/User');
const { promisify } = require('util');
const { jwtConfig } = require('../config');

const passport = require('passport');

exports.signup = (req, res, next) => {
	passport.authenticate('signup', { session: false }, async (err, user, info) => {

		res.json({ message: 'YAY!', user });

	})(req, res, next)
}

exports.login = (req, res, next) => {
	passport.authenticate('login', { session: false }, async (err, user, info) => {

		if (err || !user)
			return next(new Error('An error occurred.'))

		req.login(user, { session: false }, async (err) => {
			if (err) return next(err)

			const token = jwt.sign({ id: user.id }, jwtConfig.secret)

			const cookieOptions = {
				expires: new Date(Date.now() + jwtConfig.cookieExpireTime * 24 * 60 * 60 * 1000),
				httpOnly: true
			}

			res.cookie('jwt', token, cookieOptions)
			return res.redirect('/')
		})

	})(req, res, next)
}