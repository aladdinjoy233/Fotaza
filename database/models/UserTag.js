const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db');

class UserTag extends Model {}

UserTag.init({
  follow_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'user_tags',
  tableName: 'user_tags'
})

module.exports = UserTag;