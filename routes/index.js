var express = require('express');
var router = express.Router();

const indexController = require('../controllers/indexController')

router.get('/', indexController.indexView)
router.get('/search', indexController.searchView)

module.exports = router;