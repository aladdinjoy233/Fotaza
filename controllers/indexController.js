exports.indexView = async (req, res, next) => {
	res.render('index', { title: 'Fotaza', scripts: ['index'] })
}

exports.searchView = async (req, res, next) => {
	const { q } = req.query
	res.render('search', { title: 'Busqueda | Fotaza', scripts: ['search'], query: q })
}

exports.popularView = async (req, res, next) => {
	res.render('popular', { title: 'Destacado | Fotaza', scripts: ['popular'] })
}