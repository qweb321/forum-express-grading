const { Restaurant, Category } = require('../models')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    const categoryId = Number(req.query.categoryId) || ''
    Promise.all([
      Restaurant.findAll({
        where: {
          ...categoryId ? { categoryId } : {}
        },
        raw: true,
        nest: true,
        include: [Category]
      }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurants, categories]) => {
        const data = restaurants.map(rest => ({
          ...rest,
          description: rest.description.substring(0, 50)
        }))
        return res.render('restaurants', { restaurants: data, categories })
      })
      .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id,
      {
        raw: true,
        nest: true,
        include: [Category]
      })
      .then(restaurant => {
        if (!restaurant) throw new Error("restaurant didn't exist!")
        res.render('restaurant', { restaurant })
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    Restaurant.findByPk(req.params.id, {
      nest: true,
      include: [Category]
    })
      .then(restaurant => {
        return restaurant.increment('viewCounts')
      })
      .then(restaurant => {
        return restaurant.reload()
      })
      .then(restaurant => {
        return res.render('restaurant-dashboard', { restaurant: restaurant.toJSON() })
      })
      .catch(err => next(err))
  }
}
module.exports = restaurantController
