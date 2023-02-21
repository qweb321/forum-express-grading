'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Booking.belongsTo(models.ReserveInfo, { foreignKey: 'reserveinfoId' })
      Booking.belongsTo(models.Restaurant, { foreignKey: 'restaurantId' })
      Booking.belongsTo(models.Customer, { foreignKey: 'customerId' })
      // define association here
    }
  };
  Booking.init({
    restaurantId: DataTypes.INTEGER,
    customerId: DataTypes.INTEGER,
    tableId: DataTypes.INTEGER,
    timeId: DataTypes.INTEGER,
    date: DataTypes.DATEONLY,
    numberOfAdult: DataTypes.INTEGER,
    numberOfChildren: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Booking',
    tableName: 'Bookings',
    underscored: true
  })
  return Booking
}
