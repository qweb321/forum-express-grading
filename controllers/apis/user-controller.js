const jwt = require('jsonwebtoken')
const userServices = require('../../services/user-services')
const userController = {
  signIn: (req, res, next) => {
    try {
      const userData = req.user.toJSON() // 前面因為要使用token驗證，把session設定改為false，在passport設定中不會進入反序列化
      delete userData.password // 刪除敏感資料
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' }) // 簽發 JWT，效期為 30 天
      res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (err) {
      next(err)
    }
  },
  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}
module.exports = userController
