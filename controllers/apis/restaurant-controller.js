const { ReserveInfo, Booking } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')
const { Sequelize } = require('sequelize')
const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.json(data))
  },
  getReservation: async (req, res, next) => {
    try {
      console.log(req.query)
      const { orderTime, adult, children } = req.query
      let condition = ''
      if (Number(adult) + Number(children) <= 2) {
        condition = 'twoSeater'
      } else if (Number(adult) + Number(children) > 2 && Number(adult) + Number(children) <= 4) {
        condition = 'fourSeater'
      } else {
        condition = 'sixSeater'
      }
      console.log(condition)
      console.log(typeof orderTime)
      const bookingCounts = await Booking.count({
        where: {
          restaurantId: req.params.id
          // date: String(orderTime) // 這裡搜尋失敗
        },
        raw: true,
        group: ['restaurantId', 'reserveinfoId', 'arrangeTable', 'date']
      })
      const availableTime = await ReserveInfo.findAll({
        where: {
          restaurantId: req.params.id
        },
        attributes: ['id', 'openingTime', condition],
        raw: true
      })
      res.json({ availableTime, bookingCounts, condition })
    } catch (err) {
      return next(err)
    }
  }
}
module.exports = restaurantController
