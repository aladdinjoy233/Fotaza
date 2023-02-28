const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');

// Necesario para Google
const GoogleStrategy = require('passport-google-oauth2').Strategy;
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
))

// Funcion para logear un usuario
passport.use('login', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
	},
	async (email, password, done) => {
		const user = await User.findOne({ where: { email } })

		// Si no existe el usuario, devolver error
		if (!user) return done(null, false, { message: 'Usuario no existente' })

		// Validar la contraseña
		const validate = await bcrypt.compare(password, user.password)
		if (!validate) return done(null, false, { message: 'Contraseña equivocado' })

		return done(null, user, { message: 'Logeado!' })
	}
))

passport.use('auth-google',
	new GoogleStrategy({
		clientID: googleConfig.GOOGLE_CLIENT_ID,
		clientSecret: googleConfig.GOOGLE_CLIENT_SECRET,
		callbackURL: "http://127.0.0.1:3000/auth/google",
		passReqToCallback: true
	},
	async (request, accessToken, refreshToken, profile, done) => {

		const email = profile.emails[0].value
		const user = await User.findOne({ where: { email } })

		// Si no existe el usuario, crealo
		if (user == null) {
			const password = await bcrypt.hash(profile.id, 8)
			const newUser = await User.create({ email, password	})

			done(null, newUser)
		} else { // Si existe, hacer logeo
			done(null, user)
		}
	}
));
