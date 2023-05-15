const { Model, DataTypes } = require('sequelize')
const sequelize = require('../db')

class Category extends Model {}

Category.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category_name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'categories',
  tableName: 'categories'
})

module.exports = Category