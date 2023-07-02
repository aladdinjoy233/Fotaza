const { Model, DataTypes } = require('sequelize')
const sequelize = require('../db')

class PhotoInterested extends Model {}

PhotoInterested.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	created_at: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	updated_at: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW,
	},
}, {
	sequelize,
	modelName: 'photo_interested',
	tableName: 'photo_interested',
	timestamps: true,
	createdAt: 'created_at',
	updatedAt: 'updated_at',
})

module.exports = PhotoInterested