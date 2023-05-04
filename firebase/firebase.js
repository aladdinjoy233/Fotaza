var { initializeApp } = require('firebase/app');
var { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { firebaseConfig } = require('../config');
const path = require('path');
const { randomBytes } = require('crypto');

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

exports.uploadAvatar = async (userId, file) => {
	const { originalname, buffer } = file;

	// Generate a random string
	const randomString = randomBytes(6).toString('hex');
	const ext = path.extname(originalname);

	// Creates storage ref, if it exists, then overrides last file
	const storageRef = ref(storage, `avatar/${userId}_${randomString}${ext}`);

	try {
		await uploadBytes(storageRef, buffer);
		const downloadUrl = await getDownloadURL(storageRef);
		return downloadUrl;
	} catch (error) {
		console.log(error);
		return null;
	}
}