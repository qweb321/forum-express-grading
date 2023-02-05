const bcrypt = require('bcryptjs')
const { User } = require('../models')

const userServices = {
  signUp: (req, cb) => {
    const { name, email, password, passwordCheck } = req.body

    if (password !== passwordCheck) throw new Error('Password do not match')

    User.findOne({ where: { email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        return bcrypt.hash(password, 10)
        // 讓Promise resolve 的值傳到下個then再繼續接著做事，避免巢狀結構或非同步狀態不知道誰會先完成
      })
      .then(hash => {
        return User.create({
          name,
          email,
          password: hash
        })
      })
      .then(user => cb(null, user))
      .catch(err => cb(err))
  }
}

module.exports = userServices
