'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class AvailableTime extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  AvailableTime.init({
    restaurantId: DataTypes.INTEGER,
    time: DataTypes.STRING,
    isAvailable: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'AvailableTime',
    tableName: 'AvailableTimes',
    underscored: true
  })
  return AvailableTime
}
