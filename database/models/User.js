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
		allowNull: false
	},
	usuario: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false
	}

}, {
	sequelize,
	modelName: 'user',
	tableName: 'user'
})