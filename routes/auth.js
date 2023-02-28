var express = require('express');
var router = express.Router();

const authController = require('../controllers/authController')

router.get('/', authController.isLoggedIn, (req, res, next) => {
  res.render('login', { title: 'Login', scripts: ['login'] })
});

// Passport rutas
router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.get('/google', authController.googleLogin)

module.exports = router;
