const express = require('express')
const router = express.Router()

const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

const authController = require('../controllers/authController')
const photoController = require('../controllers/photoController')

router.get('/', authController.isAuthenticated, photoController.createView)
router.post('/post', authController.isAuthenticated, upload.single('photo'), photoController.post)

// router.get('/', (req, res) => res.redirect('/auth'))
// router.get('/edit', authController.isAuthenticated, userController.editProfile)
// router.get('/:slug', userController.userProfile)
// router.get('/get/:userId', authController.isAuthenticated, userController.get)
// router.post('/checkAvailable', authController.isAuthenticated, userController.checkAvailable)
// router.post('/edit', authController.isAuthenticated, upload.single('avatar'), userController.edit)

module.exports = router;