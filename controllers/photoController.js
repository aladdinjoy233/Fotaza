const Photo = require('../database/models/Photo')
const User = require('../database/models/User')
const Category = require('../database/models/Category')
const Right = require('../database/models/Right')
const Tag = require('../database/models/Tag')
const PhotoComment = require('../database/models/PhotoComment')
const PhotoRating = require('../database/models/PhotoRating')
const PhotoInterested = require('../database/models/PhotoInterested')

const sharp = require('sharp')
const { uploadPhoto, deletePhoto } = require('../firebase/firebase')
const { Op } = require('sequelize')

exports.createView = async (req, res, next) => {
	const categories = await Category.findAll({
		attributes: ['id', 'category_name'],
		order: [['category_name', 'ASC']]
	})

	const rights = await Right.findAll({
		attributes: ['id', 'rights_name'],
		order: [['rights_name', 'ASC']]
	})

	res.render('create', { title: 'Create | Fotaza', scripts: ['create'], categories, rights })
}

exports.post = async (req, res, next) => {
	const { title, category_id, rights_id, is_private, user_id } = JSON.parse(req.body.photoData)
	let { watermark } = JSON.parse(req.body.photoData)

	if (!title || !category_id || !rights_id || is_private == undefined || watermark == undefined ) return res.status(400).json({ error: true, errorMsg: 'Faltan datos' })

	if (!user_id) return res.status(400).json({ error: true, errorMsg: 'Foto sin usuario' })

	// Verificar que la publicacion pertenece al usuario logeado
	if (req.user.id != user_id) return res.status(400).json({ error: true, errorMsg: 'No estás autorizado' })

	if (!req.file) return res.status(400).json({ error: true, errorMsg: 'Foto no subida' })

	const { format, width, height } = await sharp(req.file.buffer).metadata()
	if (!format || !width || !height) return res.status(400).json({ error: true, errorMsg: 'Hubo un error con el archivo' })

	// Funciones: marca de agua
	if (watermark == '' && !is_private) watermark = `Fotaza @${req.user.usuario}`
	const watermarkedBuffer = await addWatermark(req.file.buffer, watermark)
	if (!watermarkedBuffer) return res.status(400).json({ error: true, errorMsg: 'Hubo un error con el archivo' })

	var photoUrl;
	try {
		photoUrl = await uploadPhoto(user_id, req.file, watermarkedBuffer)
	} catch (err) {
		console.log(err)
		return res.status(400).json({ error: true, errorMsg: 'Error al subir la foto' })
	}
	
	if (!photoUrl) return res.status(400).json({ error: true, errorMsg: 'Error al subir la foto' })

	const photo = await Photo.create({
		user_id,
		category_id,
		rights_id,
		title,
		format,
		resolution: `${width}x${height}`,
		file_path: photoUrl,
		is_private
	})

	let { tags } = JSON.parse(req.body.photoData)
	tags = tags.slice(0, 3)

	// Verificar que los tags no esten repetidos
	const dbTags = []
	for (const tag of tags) {
		const existingTag = await Tag.findOne({ where: { tag_name: tag } })

		if (existingTag) {
			dbTags.push(existingTag)
		} else {
			const newTag = await Tag.create({ tag_name: tag })
			dbTags.push(newTag)
		}
	}
	
	if (dbTags.length > 0) await photo.addTags(dbTags)

	return res.redirect('/')
}

exports.edit = async (req, res, next) => {
	const { photoId } = req.params

	const photo = await Photo.findByPk(photoId)

	if (!photo) return res.redirect('/')
	if (photo.user_id != req.user.id) return res.redirect('/')

	const categories = await Category.findAll({
		attributes: ['id', 'category_name'],
		order: [['category_name', 'ASC']]
	})

	const rights = await Right.findAll({
		attributes: ['id', 'rights_name'],
		order: [['rights_name', 'ASC']]
	})

	const tags = await photo.getTags({ attributes: ['tag_name'] })

	res.render('edit', { title: 'Edit | Fotaza', scripts: ['edit'], photo, categories, rights, tags })
}

exports.editPost = async (req, res, next) => {
	const { photo_id, user_id, title, category_id, rights_id, is_private } = req.body
	let { tags } = req.body

	if (!photo_id || !title || !category_id || !rights_id || is_private == undefined ) return res.status(400).json({ error: true, errorMsg: 'Faltan datos' })

	if (!user_id) return res.status(400).json({ error: true, errorMsg: 'Foto sin usuario' })

	// Verificar que la publicacion pertenece al usuario logeado
	if (req.user.id != user_id) return res.status(400).json({ error: true, errorMsg: 'No estás autorizado' })

	let photo = await Photo.findByPk(photo_id)
	if (!photo) return res.status(400).json({ error: true, errorMsg: 'Foto no existe' })

	// Actualizar los campos
	photo = await photo.update({ title, category_id, rights_id, is_private })

	// Actualizar tags
	tags = tags.slice(0, 3)

	// Verificar que los tags no esten repetidos
	const dbTags = []
	for (const tag of tags) {
		const existingTag = await Tag.findOne({ where: { tag_name: tag } })

		if (existingTag) {
			dbTags.push(existingTag)
		} else {
			const newTag = await Tag.create({ tag_name: tag })
			dbTags.push(newTag)
		}
	}
	
	await photo.setTags(dbTags)

	return res.redirect('/')
}

async function addWatermark(file, watermark) {
	const image = sharp(file)
	const metadata = await image.metadata()

	const watermarkSvg = `
		<svg xmlns="http://www.w3.org/2000/svg" width="${metadata.width}" height="${metadata.height}">
			<text
				x="10"
				y="${metadata.height - 10}"
				fill="#CCCCCC"
				font-family="Arial"
				font-size="20"
				alignment-baseline="baseline">
				${watermark}
			</text>
		</svg>
	`;

	const watermarkedBuffer = await image
		.composite([
			{
				input: Buffer.from(watermarkSvg),
				gravity: 'southeast'
			}
		])
		.toBuffer()

	return watermarkedBuffer
}

exports.deletePost = async (req, res, next) => {
	const { photo_id } = req.body
	if (!photo_id) return res.status(400).json({ error: true, errorMsg: 'Faltan datos' })
	
	const photo = await Photo.findByPk(photo_id)
	if (!photo) return res.status(400).json({ error: true, errorMsg: 'Error con la foto' })
	
	if (!req.user || photo.user_id != req.user.id) return res.status(400).json({ error: true, errorMsg: 'No tiene permiso' })

	// Borrar la imagen del storage en Firebase
	const isDeleted = await deletePhoto(photo.file_path)
	if (!isDeleted) return res.status(400).json({ error: true, errorMsg: 'Error con el borrado de la foto' })

	await photo.destroy()

	return res.redirect('/')
}

// ===================
// Get posts functions
// ===================

exports.getPosts = async (req, res, next) => {
	const { page, limit } = req.query

	// Para la paginacion, verificar para que no traiga todo
	if (!page || !limit) return res.status(400)

	const offset = (page - 1) * limit
	const parsedLimit = parseInt(limit, 10)

	const where = {}
	if (req.loggedIn && req.user) {
		where.user_id = {[Op.not]: req.user.id}
	}

	// Si el usuario no esta logeado, solo devolver los posts publicos
	if (!req.loggedIn) {
		where.is_private = false
	}

	try {
		const photos = await Photo.findAll({
			offset,
			limit: parsedLimit,
			where,
			order: [['created_at', 'DESC']],
			attributes: ['id', 'user_id', 'title', 'file_path', 'is_private', 'created_at'],
			include: [
				{
					model: User,
					attributes: ['id', 'usuario', 'avatar', 'nombre']
				},
				{
					model: Tag,
					attributes: ['tag_name']
				},
				{
					model: PhotoRating,
					attributes: ['rating_value', 'user_id']
				}
			]
		})
		
		const finalPhotos = filterPhotosArray(photos, req)
		return res.status(200).json(finalPhotos)
	} catch (err) {
		console.log(err)
		return res.status(400).json({ error: true, errorMsg: 'Hubo un error' })
	}

}

exports.getUserPosts = async (req, res, next) => {
	const { userId } = req.params
	const where = { user_id: userId }

	// Si el usuario no esta logeado, solo devolver los posts publicos
	if (!req.loggedIn) {
		where.is_private = false
	}

	const photos = await Photo.findAll({
		where,
		order: [['created_at', 'DESC']],
		attributes: ['id', 'user_id', 'title', 'file_path', 'is_private', 'created_at'],
		include: [
			{
				model: User,
				attributes: ['id', 'usuario', 'avatar', 'nombre']
			},
			{
				model: Tag,
				attributes: ['tag_name']
			},
			{
				model: PhotoRating,
				attributes: ['rating_value', 'user_id']
			}
		]
	})

	const finalPhotos = filterPhotosArray(photos, req)
	return res.status(200).json(finalPhotos)
}

exports.viewPost = async (req, res, next) => {
	const { photoId } = req.params
	if (!photoId) return res.status(400).redirect('/')
	if (isNaN(photoId)) return res.status(400).redirect('/')

	let photo = await Photo.findByPk(photoId, {
		include: [
			{
				model: User,
				attributes: ['id', 'usuario', 'avatar', 'nombre']
			},
			{
				model: Tag,
				attributes: ['tag_name']
			},
			{
				model: PhotoRating,
				attributes: ['rating_value', 'user_id']
			},
			{
				model: PhotoComment,
				attributes: ['id', 'comment', 'created_at'],
				include: [
					{
						model: User,
						attributes: ['usuario', 'avatar', 'nombre']
					}
				]
			},
			{
				model: PhotoInterested,
				attributes: ['id', 'photo_id', 'user_id'],
				include: [
					{
						model: User,
						attributes: ['usuario', 'avatar', 'nombre']
					}
				]
			}
		]
	})
	if (!photo) return res.status(400).redirect('/')
	if (photo.is_private && !req.loggedIn) return res.status(400).redirect('/auth')

	photo = filterPhoto(photo, req)
	res.render('photo', { title: 'Foto | Fotaza', scripts: ['photo'], photo })
}

// ====================
// Ratings functions
// ====================
exports.setRating = async (req, res, next) => {
	const { photoId } = req.params
	let { rating } = req.body
	const user = req.user

	if (!photoId || !rating || !user) return res.status(400).json({ error: true, errorMsg: 'Error al guardar la calificación' })

	rating = parseInt(rating)
	if (isNaN(rating)) return res.status(400).json({ error: true, errorMsg: 'La calificación debe ser un número' })

	if (rating > 5) rating = 5
	if (rating < 1) rating = 1

	let savedRating = await PhotoRating.findOne({ where: { photo_id: photoId, user_id: user.id } })

	if (savedRating) {
		savedRating.rating_value = rating
		await savedRating.save()
	} else {
		savedRating = await PhotoRating.create({ photo_id: photoId, user_id: user.id, rating_value: rating })
	}

	const photo = await Photo.findByPk(photoId, { include: PhotoRating })
	return res.status(200).json({ rating: savedRating.rating_value, average: getRatingAverage(photo) })
}

function filterPhotosArray(photos, req) {
	return photos.map(photo => {
		let rating_average = getRatingAverage(photo)
		
		let user_rating = null
		if (req.loggedIn && req.user) {
			const rating = photo.photo_ratings.find(rating => rating.user_id == req.user.id)
			user_rating = rating ? rating.rating_value : null
		}

		return {
			...photo.toJSON(),
			rating_average,
			user_rating
		}
	})
}

function filterPhoto(photo, req) {
	let rating_average = getRatingAverage(photo)

	// Obtener el rating
	let user_rating = null
	if (req.loggedIn && req.user) {
		const rating = photo.photo_ratings.find(rating => rating.user_id == req.user.id)
		user_rating = rating ? rating.rating_value : null
	}

	// Obtener si estan interesados
	let user_interested = false
	if (req.loggedIn && req.user) {
		const interested = photo.photo_interesteds.find(interested => interested.user_id == req.user.id)
		if (interested) user_interested = true
	}

	// Cambiar orden de los comentarios
	const reverseComments = photo.photo_comments.reverse()
	photo.photo_comments = reverseComments

	return {
		...photo.toJSON(),
		rating_average,
		user_rating,
		user_interested
	}
}

function getRatingAverage(photo) { // Photo object
	let rating_average = photo.photo_ratings.map(rating => rating.rating_value).reduce((a, b) => a + b, 0) / photo.photo_ratings.length
	rating_average = isNaN(rating_average) ? null : Number(rating_average.toFixed(1))
	return rating_average
}

// ====================
// Comments functions
// ====================
exports.setComment = async (req, res, next) => {
	const { photoId } = req.params
	let { comment } = req.body
	const user = req.user

	if (!photoId || !comment || !user) return res.status(400).json({ error: true, errorMsg: 'Error al enviar comentario' })

	let savedComment = await PhotoComment.create({ photo_id: photoId, user_id: user.id, comment: comment.trim() })

	savedComment = await PhotoComment.findOne({
		where: { id: savedComment.id },
		attributes: ['id', 'comment', 'created_at'],
		include: [
			{
				model: User,
				attributes: ['id', 'usuario', 'avatar', 'nombre']
			}
		]
	})

	return res.status(200).json({ savedComment })
}

// ====================
// Interested functions
// ====================
exports.setInterested = async (req, res, next) => {
	const { photoId } = req.params
	let { interested } = req.body
	const user = req.user

	if (!photoId || interested == undefined || !user) return res.status(400).json({ error: true, errorMsg: 'Error al marcar como interesado' })

	let savedInterested = null, created = null
	if (interested) {
		[savedInterested, created] = await PhotoInterested.findOrCreate({
			where: { photo_id: photoId, user_id: user.id }
		})

		// Despues de crear/buscarlo, obtener los datos necesarios
		savedInterested = await PhotoInterested.findByPk(savedInterested.id, {
			attributes: ['id', 'photo_id', 'user_id'],
			include: [
				{
					model: User,
					attributes: ['id', 'usuario', 'avatar', 'nombre']
				}
			]
		})
	} else {
		await PhotoInterested.destroy({ where: { photo_id: photoId, user_id: user.id } })
	}

	return res.status(200).json({ savedInterested, interested })
}