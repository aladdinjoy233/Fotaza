var express = require('express');
var router = express.Router();

const authController = require('../controllers/authController')

router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login', scripts: ['login'] })
});

// Example on how to return data
// router.get('/test', function(req, res, next) {
//   res.json({ title: 'Test', sentence: ['this', 'is', 'a', 'test'] })
// });

// router.post('/login', function(req, res, next) {

// 	console.log(`User's email: ${req.body.email}`)
// 	console.log(`User's password: ${req.body.password}`)

//   res.json({ title: 'Login!', data: [req.body.email, req.body.password] })
// });

// router.post('/signup', function(req, res, next) {

// 	console.log(`User's email: ${req.body.email}`)
// 	console.log(`User's password: ${req.body.password}`)

//   res.json({ title: 'Signup!', data: [req.body.email, req.body.password] })
// });

// Passport rutas
router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/logout', authController.logout)

module.exports = router;
