const { Restaurant, Category, User } = require('../../models')
const { imgurFileHandler } = require('../../helpers/file-helpers')

const adminController = {
  getRestaurants: (req, res, next) => {
    Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurants => {
        restaurants.forEach(rest => {
          if (rest.categoryId === null) {
            rest.Category.name = '(未分類)'
          }
        })
        res.render('admin/restaurants', { restaurants })
      })
      .catch(err => next(err))
  },

  createRestaurant: (req, res) => {
    return Category.findAll({
      raw: true
    })
      .then(categories => res.render('admin/create-restaurant', { categories }))
  },

  postRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    const { file } = req
    if (!name) throw new Error('Restaurant name is required!')

    return imgurFileHandler(file)
      .then(filePath =>
        Restaurant.create({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || null,
          categoryId
        })
      )
      .then(() => {
        req.flash('success_messages', 'Restaurant was successfully created')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },

  getRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        res.render('admin/restaurant', { restaurant })
      })
      .catch(err => next(err))
  },

  editRestaurant: (req, res, next) => {
    Promise.all([
      Restaurant.findByPk(req.params.id, { raw: true }),
      Category.findAll({ raw: true })])
      .then(([restaurant, categories]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")

        return res.render('admin/edit-restaurant', { restaurant, categories })
      })
      .catch(err => next(err))
  },

  putRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    const { file } = req
    if (!name) throw new Error('Restaurant name is required!')
    Promise.all([
      Restaurant.findByPk(req.params.id),
      imgurFileHandler(file)
    ])
      .then(([restaurant, filePath]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")

        return restaurant.update({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || restaurant.image,
          categoryId: categoryId || null
        })
      })
      .then(() => {
        req.flash('success_messages', 'restaurant was successfully to update')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },

  deleteRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")

        return restaurant.destroy()
      })
      .then(() => res.redirect('/admin/restaurants'))
      .catch(err => next(err))
  },
  getUsers: (req, res, next) => {
    User.findAll({ raw: true })
      .then(users => {
        res.render('admin/users', { users })
      })
      .catch(err => next(err))
  },
  patchUser: (req, res, next) => {
    User.findByPk(req.params.id)
      .then(user => {
        console.log(user.isAdmin)
        if (user.isAdmin) {
          return user.update({ isAdmin: false })
        } else {
          return user.update({ isAdmin: true })
        }
      })
      .then(() => {
        req.flash('success_messages', 'user was successfully to update')
        res.redirect('/admin/users')
      })
      .catch(err => next(err))
  }
}
module.exports = adminController
