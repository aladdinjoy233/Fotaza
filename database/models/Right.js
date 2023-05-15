const { Model, DataTypes } = require('sequelize')
const sequelize = require('../db')

class Right extends Model {}

Right.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rights_name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'rights',
  tableName: 'rights'
})

module.exports = Right