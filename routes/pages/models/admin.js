
const express = require('express')
const router = express.Router()
const adminController = require('../../../controllers/pages/admin-controller')
const categoryController = require('../../../controllers/pages/category-controller')
const reserveInfoController = require('../../../controllers/pages/reserveInfo-controller')
const upload = require('../../../middleware/multer')

router.get('/categories/:id', categoryController.getCategories)
router.put('/categories/:id', categoryController.putCategory)
router.delete('/categories/:id', categoryController.deleteCategory)
router.get('/categories', categoryController.getCategories)
router.post('/categories', categoryController.postCategories)

router.patch('/users/:id', adminController.patchUser)
router.get('/users', adminController.getUsers)

router.post('/reservations/create/table/:id', reserveInfoController.postTable)
router.post('/reservations/create/time/:id', reserveInfoController.postAvailableTime)
router.put('/reservations/:id/table', reserveInfoController.putTable)
router.put('/reservations/:id/time', reserveInfoController.putAvailableTime)
router.delete('/reservations/:id/time', reserveInfoController.deleteAvailableTime)
router.delete('/reservations/:id/table', reserveInfoController.deleteTable)

router.get('/restaurants/create', adminController.createRestaurant)
router.get('/restaurants/:id/edit', adminController.editRestaurant)
router.get('/restaurants/:id', adminController.getRestaurant)
router.put('/restaurants/:id', upload.single('image'), adminController.putRestaurant)
router.delete('/restaurants/:id', adminController.deleteRestaurant)
router.get('/restaurants', adminController.getRestaurants)
router.post('/restaurants', upload.single('image'), adminController.postRestaurant)
router.use('/', (req, res) => res.redirect('/admin/restaurants'))

module.exports = router
