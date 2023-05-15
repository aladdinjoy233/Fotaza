const { Model, DataTypes } = require('sequelize')
const sequelize = require('../db')

class Photo extends Model {}

Photo.init({
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},
	user_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	category_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	rights_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	description: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	file_path: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	is_private: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
	created_at: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW,
	},
	updated_at: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW,
	},
}, {
	sequelize,
	modelName: 'photos',
	tableName: 'photos',
	timestamps: true,
	createdAt: 'created_at',
	updatedAt: 'updated_at',
})

module.exports = Photo;