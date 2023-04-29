var express = require('express');
var router = express.Router();

const authController = require('../controllers/authController')

router.get('/', authController.isAuthenticated, (req, res, next) => {
	res.render('index', { title: 'Index', scripts: [] })
})

module.exports = router;
