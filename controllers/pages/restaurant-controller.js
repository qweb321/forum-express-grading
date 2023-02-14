const { Restaurant, Category, Comment, User, ReserveInfo, Customer, Booking } = require('../../models')
const { getOffset, getPagination } = require('../../helpers/pagination-helper')
const Sequelize = require('sequelize')
const dayjs = require('dayjs')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    const DEFAULT_LIMIT = 9
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)
    const categoryId = Number(req.query.categoryId) || ''
    Promise.all([
      Restaurant.findAndCountAll({
        where: {
          ...categoryId ? { categoryId } : {}
        },
        limit,
        offset,
        raw: true,
        nest: true,
        include: [Category]
      }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurants, categories]) => {
        const favoritedRestaurantsId = req.user && req.user.FavoritedRestaurants.map(fr => fr.id)
        const likedRestaurantsId = req.user && req.user.LikedRestaurants.map(lr => lr.id)
        const data = restaurants.rows.map(rest => ({
          ...rest,
          description: rest.description.substring(0, 50),
          isFavorited: favoritedRestaurantsId.includes(rest.id),
          isLiked: likedRestaurantsId.includes(rest.id)
        }))
        return res.render('restaurants', { restaurants: data, categories, categoryId, pagination: getPagination(limit, page, restaurants.count) })
      })
      .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id,
      {
        nest: true,
        include: [
          Category,
          { model: Comment, include: User },
          { model: User, as: 'FavoritedUsers' },
          { model: User, as: 'LikedUsers' }
        ],
        order: [[Comment, 'createdAt', 'DESC']]
      })
      .then(restaurant => {
        const isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
        const isLiked = restaurant.LikedUsers.some(f => f.id === req.user.id)

        if (!restaurant) throw new Error("restaurant didn't exist!")
        restaurant.increment('viewCounts')
        res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited, isLiked })
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    Restaurant.findByPk(req.params.id, {
      attributes: {
        include: [[Sequelize.fn('COUNT', Sequelize.col('Comments.id')), 'commentsCount']]
      },
      nest: true,
      include: [Category, { model: Comment, attributes: [] }]
    })
      .then(restaurant => {
        return res.render('restaurant-dashboard', { restaurant: restaurant.toJSON() })
      })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [Category],
        raw: true,
        nest: true
      }),
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant],
        raw: true,
        nest: true
      })
    ])
      .then(([restaurants, comments]) => {
        res.render('feeds', {
          restaurants,
          comments
        })
      })
      .catch(err => next(err))
  },
  getTopRestaurants: (req, res, next) => {
    return Restaurant.findAll({
      include: [{ model: User, as: 'FavoritedUsers' }]
    })
      .then(restaurants => {
        const result = restaurants.map(rest => ({
          ...rest.toJSON(),
          description: rest.description.substring(0, 50),
          favoritesCount: rest.FavoritedUsers.length,
          isFavorited: rest.FavoritedUsers.some(f => f.id === req.user.id)
        }))
          .sort((a, b) => b.favoritesCount - a.favoritesCount)
          .slice(0, 10)
        res.render('top-restaurants', { restaurants: result })
      })
  },
  getReservation: (req, res, next) => {
    Promise.all([
      Restaurant.findByPk(req.params.restaurantId, { raw: true }),
      ReserveInfo.findAll({
        where: { restaurantId: req.params.restaurantId },
        raw: true,
        nest: true
      })
    ])
      .then(([restaurant, reservation]) => {
        const key = process.env.GOOGLE_KEY
        const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${key}&q=${restaurant.address}&language=tw`
        res.render('restaurant-reservation', { restaurant, reservation, mapSrc })
      })
      .catch(err => next(err))
  },
  postReservation: (req, res, next) => {
    const { reservedTime, adult, children, orderTime } = req.body
    Restaurant.findByPk(req.params.restaurantId, { raw: true })
      .then(restaurant => {
        res.render('reservation-check', { restaurant, reservedTime, adult, children, orderTime })
      })
      .catch(err => next(err))
  },
  postBookingForm: (req, res, next) => {
    const { name, gender, phone, email, adult, children, date, time, remark } = req.body
    if (!name || !phone || !email) throw new Error('姓名、手機號碼及Email為必填欄位')
    Promise.all([
      ReserveInfo.findOne({
        where: {
          restaurantId: req.params.restaurantId,
          openingTime: time
        }
      }),
      Customer.create({
        name,
        gender,
        phone,
        email,
        remark: remark || 'no require'
      })
    ])
      .then(([reservation, customer]) => {
        if (!customer) throw new Error('訂位失敗，請重新確認')
        if (!reservation) throw new Error('訂位時間未選擇，請回上一頁重新選擇')
        return Booking.create({
          restaurantId: req.params.restaurantId,
          customerId: customer.id,
          date,
          numberOfAdult: adult,
          numberOfChildren: children,
          reserveinfoId: reservation.id
        })
      })
      .then(info1 => {
        const info = info1.toJSON()
        console.log(info)
        console.log(info.customerId)
        return Booking.findOne({
          where: {
            customerId: info.customerId
          },
          raw: true,
          nest: true,
          include: [Restaurant, Customer, ReserveInfo]
        })
      })
      .then(info => {
        console.log(info)
        info.date = dayjs(info.date).format('YYYY/MM/DD')
        res.render('reservation-complete', { info })
      })
      .catch(err => next(err))
  }
}
module.exports = restaurantController
