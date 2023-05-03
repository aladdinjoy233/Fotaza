var { initializeApp } = require('firebase/app');
var { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { firebaseConfig } = require('../config');

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

exports.uploadFile = async file => {
	const { originalname, buffer } = file;

	// Creates storage ref, if it exists, then overrides last file
	const storageRef = ref(storage, `files/${originalname}`);

	try {
		await uploadBytes(storageRef, buffer);
		const downloadUrl = await getDownloadURL(storageRef);
		console.log(`File available at ${downloadUrl}`);
		return downloadUrl;
	} catch (error) {
		console.log(error);
		return null;
	}
}

exports.uploadAvatar = async file => {
	const { originalname, buffer } = file;

	// Creates storage ref, if it exists, then overrides last file
	const storageRef = ref(storage, `avatar/${originalname}`); // TODO: Change to random name

	try {
		await uploadBytes(storageRef, buffer);
		const downloadUrl = await getDownloadURL(storageRef);
		return downloadUrl;
	} catch (error) {
		console.log(error);
		return null;
	}
}

// This is how you'd call the function:
// var { uploadFile } = require('./firebase/firebaseConfig');
// uploadFile('config.js');