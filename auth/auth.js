const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');

// Necesario para Google
var GoogleStrategy = require('passport-google-oidc')
const { googleConfig } = require('../config')

const User = require('../database/models/User')

// Funcion para crear un usuario
passport.use('signup', new LocalStrategy({
		usernameField    : 'email',
		passwordField    : 'password',
		passReqToCallback: true
	},
	async (req, email, password, done) => {
		// Verificar que el campo no sea vacio
		if (email == '') return done(null, false, { message: 'Campo vacio' })

		// Buscar que el email no este en uso
		const user = await User.findOne({ where: { email } })
		if (user)
			return done(null, false, { message: 'Usuario ya existe' })

		// Hashear contraseña
		const passHash = await bcrypt.hash(password, 8)

		// Crear el usuario
		const newUser = await User.create({ email, password: passHash	})
		return done(null, newUser)
	}
));
