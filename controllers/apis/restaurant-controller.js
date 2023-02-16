const { ReserveInfo, Booking } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')
const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.json(data))
  },
  getReservation: async (req, res, next) => {
    try {
      const { orderTime, adult, children } = req.query
      let condition = ''
      if (Number(adult) + Number(children) <= 2) {
        condition = 'twoSeater'
      } else if (Number(adult) + Number(children) > 2 && Number(adult) + Number(children) <= 4) {
        condition = 'fourSeater'
      } else {
        condition = 'sixSeater'
      }
      const bookingCounts = await Booking.count({
        where: {
          restaurantId: req.params.id,
          date: orderTime // 時區錯誤，config中多加八小時排除
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
