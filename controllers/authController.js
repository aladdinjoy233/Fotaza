const jwt = require('jsonwebtoken');
var User = require('../database/models/User');
const { promisify } = require('util');
const { jwtConfig } = require('../config');

const passport = require('passport');

exports.signup = (req, res, next) => {
	passport.authenticate('signup', { session: false }, (err, user, info) => {
		if (err) return next(err)

		if (!user) {

			// Si da el error de missing credentials, devlolver
			if (info.message == 'Missing credentials')
				return res.render('register', { title: 'Register', error: true, errorMsg: ['Campos no pueden ser vacios'] })

			return res.render('register', { title: 'Register', error: true, errorMsg: [info.message] })
		}
		
		res.redirect('login')

	})(req, res, next)
}