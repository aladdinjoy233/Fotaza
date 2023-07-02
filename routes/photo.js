const express = require('express')
const router = express.Router({ mergeParams: true })

const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

const authController = require('../controllers/authController')
const photoController = require('../controllers/photoController')

router.get('/', authController.isAuthenticated, photoController.createView)
router.post('/post', authController.isAuthenticated, upload.single('photo'), photoController.post)
router.get('/edit/:photoId', authController.isAuthenticated, photoController.edit)
router.post('/edit', authController.isAuthenticated, photoController.editPost)
router.post('/delete', authController.isAuthenticated, photoController.deletePost)

router.get('/posts', authController.checkUserState, photoController.getPosts)
router.get('/posts/:userId', authController.checkUserState, photoController.getUserPosts)
router.get('/:photoId', authController.checkUserState, photoController.viewPost)

router.post('/:photoId/rating', authController.isAuthenticated, photoController.setRating)
router.post('/:photoId/comment', authController.isAuthenticated, photoController.setComment)
router.post('/:photoId/delete-comment', authController.isAuthenticated, photoController.deleteComment)
router.post('/:photoId/interested', authController.isAuthenticated, photoController.setInterested)

module.exports = router;