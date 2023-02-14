'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Customer.belongsToMany(models.Restaurant, {
        through: models.Booking,
        foreignKey: 'customerId',
        as: 'BookingRestaurants'
      })
      // define association here
    }
  };
  Customer.init({
    name: DataTypes.STRING,
    gender: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    remark: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Customer',
    tableName: 'Customers',
    underscored: true
  })
  return Customer
}
