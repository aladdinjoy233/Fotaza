var { initializeApp } = require('firebase/app');
var { getStorage, ref, uploadBytes, deleteObject, getDownloadURL } = require('firebase/storage');
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

exports.updateAvatar = async (userId, file, downloadUrl) => {

	const isDeleted = await this.deleteAvatar(downloadUrl);
	
	if (isDeleted) {
		const newDownloadUrl = await this.uploadAvatar(userId, file);
		return newDownloadUrl;
	} else {
		return null;
	}
}

exports.deleteAvatar = async (downloadUrl) => {
	// Parse the download URL too get the storage reference path
	const storageRef = ref(storage, getFileFromURL(downloadUrl));

	// Delete the object
	try {
		await deleteObject(storageRef);
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
}

function getFileFromURL(fileURL) {
	const fSlashes = fileURL.split('/');
  const fQuery = fSlashes[fSlashes.length - 1].split('?');
  const segments = fQuery[0].split('%2F');
  const fileName = segments.join('/');
  return fileName;
}