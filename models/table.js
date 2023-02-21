'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Table extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  Table.init({
    restaurantId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    capacity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Table',
    tableName: 'Tables',
    underscored: true
  })
  return Table
}
