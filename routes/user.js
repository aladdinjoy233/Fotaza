const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController')
const userController = require('../controllers/userController')

router.get('/', (req, res) => res.redirect('/auth'))
router.get('/edit', authController.isAuthenticated, userController.editProfile)
router.get('/:slug', userController.userProfile)
router.get('/get/:userId', authController.isAuthenticated, userController.get)

module.exports = router;