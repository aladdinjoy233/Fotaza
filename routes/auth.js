const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const authController = require('../controllers/authController')

router.get('/', authController.isLoggedIn, authController.showLogin)

// Passport rutas
router.post('/signup', upload.single('avatar'), authController.signup)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.get('/google', authController.googleLogin)

module.exports = router;