const { ReserveInfo } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')
const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.json(data))
  },
  getReservation: (req, res, next) => {
    console.log(req.query)
    const { orderTime, adult, children } = req.query
    ReserveInfo.findAll({
      where: {
        restaurantId: req.params.id
      },
      raw: true
    })
      .then(availableTime => {
        res.json(availableTime)
      })
  }
}
module.exports = restaurantController
