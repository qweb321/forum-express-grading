const { Restaurant, Category, Comment, User, AvailableTime, Customer, Booking, Table } = require('../../models')
const { getOffset, getPagination } = require('../../helpers/pagination-helper')
const Sequelize = require('sequelize')
const { Op } = require('sequelize')
const dayjs = require('dayjs')
const nodemailer = require('nodemailer')

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
          description: rest.description.substring(0, 50) || '',
          favoritesCount: rest.FavoritedUsers.length,
          isFavorited: rest.FavoritedUsers.some(f => f.id === req.user.id)
        }))
          .sort((a, b) => b.favoritesCount - a.favoritesCount)
          .slice(0, 10)
        res.render('top-restaurants', { restaurants: result })
      })
      .catch(err => next(err))
  },
  getReservation: (req, res, next) => {
    Restaurant.findByPk(req.params.restaurantId, { raw: true })
      .then(restaurant => {
        const key = process.env.GOOGLE_KEY
        const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${key}&q=${restaurant.address}&language=tw`
        res.render('restaurant-reservation', { restaurant, mapSrc })
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
  postBooking: async (req, res, next) => {
    try {
      const { name, gender, phone, email, adult, children, date, time, remark } = req.body
      if (!name || !phone || !email) throw new Error('姓名、手機號碼及Email為必填欄位')

      let capacity = 0
      if (Number(adult) + Number(children) <= 2) {
        capacity = 2
      } else if (Number(adult) + Number(children) > 2 && Number(adult) + Number(children) <= 4) {
        capacity = 4
      } else {
        capacity = 6
      }
      const availablTime = await AvailableTime.findOne({
        where: {
          restaurantId: req.params.restaurantId,
          time
        }
      })
      const customer = await Customer.create({
        name,
        gender,
        phone,
        email,
        remark: remark || 'no require'
      })
      const tables = await Table.findAll({
        attributes: ['id', 'name', 'capacity'],
        where: {
          capacity,
          restaurantId: req.params.restaurantId
        },
        include: [{
          model: Booking,
          as: Booking,
          attributes: ['table_id'],
          where: {
            date: date,
            time_id: availablTime.id
          },
          required: false
        }],
        having: {
          '$Bookings.table_id$': null
        }
      })
      if (!tables.length) throw new Error('此時段訂位已滿，請重新選擇')
      const bookingCreate = await Booking.create({
        restaurantId: req.params.restaurantId,
        customerId: customer.id,
        tableId: tables[0].id,
        timeId: availablTime.id,
        date,
        numberOfAdult: adult,
        numberOfChildren: children
      })

      const restaurant = await Restaurant.findByPk(req.params.restaurantId,
        {
          raw: true
        })

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.MODEMAILER_USER,
          pass: process.env.MODEMAILER_PASS
        }
      })

      const mailOptions = {
        from: process.env.MODEMAILER_USER,
        to: `${email}`,
        subject: '訂位成功通知',
        text: 'That was easy!',
        html: `<div style="background-color:#ffffff;">
                  <div style="margin:0px auto;max-width:2560px;">
                    <div style="margin: auto;">
                      <img src="${restaurant.image}" alt=""  style="display: block;width: 200px; margin-left: auto; margin-right: auto;">
                      <p style="text-align: center;">${name} ${gender}您好</p>
                      <p style="text-align: center;">已為您安排訂位</p>
                          <div style="border: 1px solid gray; width: 30vw; margin: auto;">
                              <p style="font-weight: bold; text-align: center;">${date}</p>
                              <p style="font-weight: bold; font-size: 2rem; color: #e58646; text-align: center;">${time}</p>
                              <p style="text-align: center;">${adult}大${children}小</p>
                          </div>
                    </div>
                  </div>
          </div>`
      }

      transporter.sendMail(mailOptions, function (error, infos, next) {
        if (error) {
          next(error)
        }
      })
      res.render('reservation-complete', { restaurant, name, gender, date, time, adult, children })
    } catch (err) {
      next(err)
    }
  },
  searchRestaurants: (req, res, next) => {
    console.log(req.query)
    const { date, time, people } = req.query
    const restaurant = req.query.restaurant.trim()

    let capacity = 0
    if (Number(people) <= 2) {
      capacity = 2
    } else if (Number(people) > 2 && Number(people) <= 4) {
      capacity = 4
    } else {
      capacity = 6
    }

    return Restaurant.findAll({
      raw: true,
      nest: true,
      where: {
        ...restaurant ? { name: { [Op.like]: `%${restaurant}%` } } : {}
      },
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('Restaurant.id')), 'id'],
        'name',
        'tel',
        'address',
        'opening_hours',
        'description',
        'image'
      ],
      include: [{
        model: Table,
        attributes: [],
        where: {
          capacity
        },
        include: [{
          model: Booking,
          required: false,
          attributes: ['date', 'table_id', 'time_id'],
          where: {
            date
          },
          include: [{
            model: AvailableTime,
            attributes: [],
            where: {
              time
            }
          }]
        }]
      }],
      having: {
        '$Tables.Bookings.table_id$': null
      }
    })
      .then(restaurants => {
        if (!restaurants.length) {
          return res.render('search-not-found', { date, time, people, restaurant })
        }
        const favoritedRestaurantsId = req.user && req.user.FavoritedRestaurants.map(fr => fr.id)
        const likedRestaurantsId = req.user && req.user.LikedRestaurants.map(lr => lr.id)
        const data = restaurants.map(rest => ({
          ...rest,
          description: rest.description.substring(0, 50),
          isFavorited: favoritedRestaurantsId.includes(rest.id),
          isLiked: likedRestaurantsId.includes(rest.id)
        }))
        res.render('search-page', { restaurants: data, date, time, people, restaurant })
      })
  }
}
module.exports = restaurantController
