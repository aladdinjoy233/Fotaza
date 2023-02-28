const jwt = require('jsonwebtoken');
var User = require('../database/models/User');
const { promisify } = require('util');
const { jwtConfig } = require('../config');

const passport = require('passport');

exports.signup = (req, res, next) => {
	passport.authenticate('signup', { session: false }, async (err, user, info) => {
		if (err) return next(err)

		if (!user) return next(new Error('No hay un usuario..'))

		return res.redirect('/')

	})(req, res, next)
}

exports.login = (req, res, next) => {
	passport.authenticate('login', { session: false }, async (err, user, info) => {

		if (err)
			return next(new Error('An error occurred...'))

		if (!user) {
			// `info.message` corresponde a `return done(null, false, { message: 'Usuario no existente' })`
			return res.json({error: true, errorMsg: info.message})
		}

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

exports.logout = (req, res) => {
	res.clearCookie('jwt')
	req.session ? req.session.destroy() : ''
	return res.redirect('/auth')
}

exports.isAuthenticated = async (req, res, next) => {
	if (!req.cookies.jwt)
		return res.redirect('/auth')

	const decodificada = await promisify(jwt.verify)(req.cookies.jwt, jwtConfig.secret)

	const user = User.findByPk(decodificada.id)

	if (user == null) return next()

	req.user = await user
	return next()
}

// Si ya esta logeado, no permitir que vuelva al login
exports.isLoggedIn = async (req, res, next) => {
	if (req.cookies.jwt) {
		const decodificada = await promisify(jwt.verify)(req.cookies.jwt, jwtConfig.secret)

		const usuario = User.findByPk(decodificada.id)

		if (usuario == null) return next()

		req.user = await usuario
		return res.redirect('/')
	} else {
		return next()
	}
}

// Google login
exports.googleLogin = async (req, res, next) => {
	passport.authenticate('auth-google', {
		session: false,
		scope: [
			'https://www.googleapis.com/auth/userinfo.email',
			'https://www.googleapis.com/auth/userinfo.profile'
		]
	}, async (err, user, info) => {

		// Si hay error, dar error
		if (err)
			return next(new Error('An error occurred...'))

		if (!user) {
			// `info.message` corresponde a `return done(null, false, { message: 'Usuario no existente' })`
			return res.json({error: true, errorMsg: info.message})
		}

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