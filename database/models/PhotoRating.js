const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db');

class PhotoRating extends Model {}

PhotoRating.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  rating_value: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
	updated_at: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW,
	},
}, {
  sequelize,
  modelName: 'photo_ratings',
  tableName: 'photo_ratings',
	timestamps: true,
	createdAt: 'created_at',
	updatedAt: 'updated_at',
});

module.exports = PhotoRating;