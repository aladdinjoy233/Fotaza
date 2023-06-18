const Photo = require('../database/models/Photo')
const User = require('../database/models/User')
const Category = require('../database/models/Category')
const Right = require('../database/models/Right')
const Tag = require('../database/models/Tag')
const PhotoComment = require('../database/models/PhotoComment')
const PhotoRating = require('../database/models/PhotoRating')

const sharp = require('sharp')
const { uploadPhoto } = require('../firebase/firebase')
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
				}
			]
		})

		return res.status(200).json(photos)
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
			}
		]
	})

	return res.status(200).json(photos)
}