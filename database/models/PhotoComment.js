const { Model, DataTypes } = require('sequelize')
const sequelize = require('../db')

class PhotoComment extends Model {}

PhotoComment.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: false
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
  modelName: 'photo_comments',
  tableName: 'photo_comments',
	timestamps: true,
	createdAt: 'created_at',
	updatedAt: 'updated_at',
})

module.exports = PhotoComment