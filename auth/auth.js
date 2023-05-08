const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

const { uploadAvatar } = require('../firebase/firebase')

// Necesario para Google
const GoogleStrategy = require('passport-google-oauth2').Strategy
const { googleConfig } = require('../config')

const User = require('../database/models/User')

// Funcion para crear un usuario
passport.use('signup', new LocalStrategy({
		usernameField    : 'email',
		passwordField    : 'password',
		passReqToCallback: true
	},
	async (req, email, password, done) => {
		// Verificar que el email no sea vacio
		if (email == '')
			return done(null, false, { message: 'Campo email vacio' })

		// Verificar que el nombre no sea vacio
		if (req.body.nombre == '')
			return done(null, false, { message: 'Campo nombre vacio' })
	
		// Verificar que el usuario no sea vacio
		if (req.body.usuario == '')
			return done(null, false, { message: 'Campo usuario vacio' })

		// Verificar que el usuario no tenga espacios
		req.body.usuario = req.body.usuario.trim()
		if (req.body.usuario.indexOf(' ') >= 0)
			return done(null, false, { message: 'No puede contener espacios' })

		// Verificar que el usuario no tenga caracteres especiales
		const usernameRegex = /^[a-zA-Z0-9_-]+$/
		if (!usernameRegex.test(req.body.usuario))
			return done(null, false, { message: 'No puede contener caracteres especiales' })

		// Verificar que el usuario no sea edit
		if (req.body.usuario.toLowerCase() == 'edit')
			return done(null, false, { message: 'Nombre usuario no permitido' })

		// Verificar que la contraseñas coincidan
		if (req.body.password != req.body.confirmPassword)
			return done(null, false, { message: 'Las contraseñas no coinciden' })

		// Buscar que el email no este en uso
		const emailCheck = await User.findOne({ where: { email } })
		if (emailCheck)
			return done(null, false, { message: 'Ya hay un usuario con ese email' })

		// Buscar que el usuario no este en uso
		const usuarioCheck = await User.findOne({ where: { usuario: req.body.usuario } })
		if (usuarioCheck)
			return done(null, false, { message: 'Ese usuario ya esta en uso' })

		// Subir el avatar al firestore storage
		let avatarUrl = null

		// Hashear contraseña
		const passHash = await bcrypt.hash(password, 8)

		// Crear el usuario
		var newUser = await User.create({
			nombre: req.body.nombre,
			usuario: req.body.usuario,
			email,
			avatar: avatarUrl,
			password: passHash
		})

		// Modifica el usuario con el avatar
		if (req.file) {
			avatarUrl = await uploadAvatar(newUser.id, req.file)
			newUser.avatar = avatarUrl
			await newUser.save()
		}

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
		const nombre = profile.given_name || null

		// Si no existe el usuario, crealo
		if (user == null) {
			const password = await bcrypt.hash(profile.id, 8)
			const newUser = await User.create({ email, password, nombre	})

			done(null, newUser)
		} else { // Si existe, hacer logeo
			done(null, user)
		}
	}
));
