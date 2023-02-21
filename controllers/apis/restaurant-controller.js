const { AvailableTime, Table } = require('../../models')
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
      const tableCounts = await Table.count({
        where: {
          restaurantId: req.params.id,
          capacity: capacity
        },
        raw: true,
        group: ['restaurantId', 'capacity']
      })
      const availableTime = await AvailableTime.findAll({
        where: {
          restaurantId: req.params.id
        },
        attributes: ['id', 'time'],
        raw: true
      })
      res.json({ availableTime, tableCounts})
    } catch (err) {
      return next(err)
    }
  }
}
module.exports = restaurantController
