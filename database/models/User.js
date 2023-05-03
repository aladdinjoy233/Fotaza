const { Model, DataTypes } = require('sequelize')
const sequelize = require('../db')

class User extends Model {}

User.init({

	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	nombre: {
		type: DataTypes.STRING,
		allowNull: true
	},
	usuario: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: true
	},
	email: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false
	},
	avatar: {
		type: DataTypes.STRING,
		allowNull: true
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false
	}

}, {
	sequelize,
	modelName: 'users',
	tableName: 'users'
})

module.exports = User