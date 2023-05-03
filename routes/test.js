// Test upload
var express = require('express');
var router = express.Router();
var { uploadFile } = require('../firebase/firebase');

var multer = require('multer');
var upload = multer({ storage: multer.memoryStorage() });

router.get('/', (req, res, next) => {
	res.render('test', { title: '', scripts: [] })
})

router.post('/upload', upload.single('testFile'), async (req, res, next) => {
	const file = req.file;

	const downloadUrl = await uploadFile(file);
	console.log(downloadUrl);

	res.send('File uploaded successfully');
})

module.exports = router;
// End Test upload