const jwt = require('jsonwebtoken');
var User = require('../database/models/User');
const { promisify } = require('util');
const { jwtConfig } = require('../config');

const passport = require('passport');

exports.signup = (req, res, next) => {
	passport.authenticate('signup', { session: false }, (err, user, info) => {

		res.json({message: 'YAY!', user});

	})(req, res, next)
}