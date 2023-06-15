const Photo = require('../database/models/Photo')
const Category = require('../database/models/Category')
const Right = require('../database/models/Right')
const Tag = require('../database/models/Tag')
const PhotoComment = require('../database/models/PhotoComment')
const PhotoRating = require('../database/models/PhotoRating')

const sharp = require('sharp')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { uploadPhoto } = require('../firebase/firebase')

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