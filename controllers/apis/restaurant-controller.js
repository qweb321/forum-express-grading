const { AvailableTime, Table, Booking } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')
const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.json(data))
  },
  getReservation: async (req, res, next) => {
    try {
      const { orderTime, adult, children } = req.query
      let capacity = 0
      if (Number(adult) + Number(children) <= 2) {
        capacity = 2
      } else if (Number(adult) + Number(children) > 2 && Number(adult) + Number(children) <= 4) {
        capacity = 4
      } else {
        capacity = 6
      }

      const availableTime = await AvailableTime.findAll({
        where: {
          restaurantId: req.params.id
        },
        attributes: ['id', 'time'],
        raw: true
      })
      const data = await Promise.all(availableTime.map(async time => {
        const count = await Table.findAll({
          where: {
            restaurantId: req.params.id,
            capacity
          },
          raw: true,
          include: [{
            model: Booking,
            as: Booking,
            attributes: ['table_id'],
            where: {
              date: orderTime,
              time_id: time.id
            },
            required: false
          }],
          having: {
            '$Bookings.table_id$': null
          }
        })
        return { time: time.time, count: Number(count.length) }
      }))

      res.json({ availableTime, data })
    } catch (err) {
      return next(err)
    }
  }
}
module.exports = restaurantController
