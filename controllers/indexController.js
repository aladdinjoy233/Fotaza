exports.indexView = async (req, res, next) => {
	res.render('index', { title: 'Fotaza', scripts: ['index'] })
}

exports.searchView = async (req, res, next) => {
	const { q } = req.query
	res.render('search', { title: 'Search | Fotaza', scripts: ['search'], query: q })
}