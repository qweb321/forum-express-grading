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
      Booking.belongsTo(models.ReserveInfo, { foreignKey: 'reserveInfoId' })
      // define association here
    }
  };
  Booking.init({
    restaurantId: DataTypes.INTEGER,
    customerId: DataTypes.INTEGER,
    date: DataTypes.DATE,
    numberOfAdult: DataTypes.INTEGER,
    numberOfChildren: DataTypes.INTEGER,
    reserveInfoId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Booking',
    tableName: 'Bookings',
    underscored: true
  })
  return Booking
}
