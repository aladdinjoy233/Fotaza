const Photo = require('../database/models/Photo')
const Category = require('../database/models/Category')
const Right = require('../database/models/Right')
const Tag = require('../database/models/Tag')
const PhotoComment = require('../database/models/PhotoComment')
const PhotoRating = require('../database/models/PhotoRating')

const sharp = require('sharp')
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

	if (!title || !category_id || !rights_id || is_private == undefined ) return res.status(400).json({ error: true, errorMsg: 'Faltan datos' })

	if (!user_id) return res.status(400).json({ error: true, errorMsg: 'Foto sin usuario' })

	// Verificar que la publicacion pertenece al usuario logeado
	if (req.user.id != user_id) return res.status(400).json({ error: true, errorMsg: 'No estás autorizado' })

	if (!req.file) return res.status(400).json({ error: true, errorMsg: 'Foto no subida' })

	const { format, width, height } = await sharp(req.file.buffer).metadata()
	if (!format || !width || !height) return res.status(400).json({ error: true, errorMsg: 'Hubo un error con el archivo' })

	var photoUrl;
	try {
		photoUrl = await uploadPhoto(user_id, req.file)
	} catch (err) {
		console.log(err)
		return res.status(400).json({ error: true, errorMsg: 'Error al subir la foto' })
	}
	
	if (!photoUrl) return res.status(400).json({ error: true, errorMsg: 'Error al subir la foto' })

	await Photo.create({
		user_id,
		category_id,
		rights_id,
		title,
		format,
		resolution: `${width}x${height}`,
		file_path: photoUrl,
		is_private
	})

	return res.redirect('/')
}
