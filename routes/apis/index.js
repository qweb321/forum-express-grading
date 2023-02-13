const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const { apiErrorHandler } = require('../../middleware/error-handler')
const restController = require('../../controllers/apis/restaurant-controller')
const userController = require('../../controllers/apis/user-controller')
const admin = require('./modules/admin')
const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')

router.use('/admin', authenticated, authenticatedAdmin, admin)
router.get('/restaurants', restController.getRestaurants)
router.get('/order/:id', restController.getReservation)
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)
router.post('/signup', userController.signUp)

router.use('/', apiErrorHandler)

module.exports = router
