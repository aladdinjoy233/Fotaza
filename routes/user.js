const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController')
const userController = require('../controllers/userController')

router.get('/get/:userId', authController.isAuthenticated, userController.get)

module.exports = router;