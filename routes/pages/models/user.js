const express = require('express')
const router = express.Router()
const userController = require('../../../controllers/pages/user-controller')
const upload = require('../../../middleware/multer')

router.get('/top', userController.getTopUsers)
router.get('/:id/edit', userController.editUser)
router.put('/:id', upload.single('image'), userController.putUser)
router.get('/:id', userController.getUser)

module.exports = router
