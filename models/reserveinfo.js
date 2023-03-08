'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class ReserveInfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      ReserveInfo.belongsTo(models.Restaurant, { foreignKey: 'restaurantId' })
      // define association here
    }
  };
  ReserveInfo.init({
    restaurantId: DataTypes.INTEGER,
    openingTime: DataTypes.STRING,
    twoSeater: DataTypes.INTEGER,
    fourSeater: DataTypes.INTEGER,
    sixSeater: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ReserveInfo',
    tableName: 'ReserveInfos',
    underscored: true
  })
  return ReserveInfo
}
