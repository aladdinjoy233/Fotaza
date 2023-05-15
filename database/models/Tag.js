const { Model, DataTypes } = require('sequelize')
const sequelize = require('../db')

class Tag extends Model {}

Tag.init({
  tag_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tag_name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'tags',
  tableName: 'tags'
})

module.exports = Tag
