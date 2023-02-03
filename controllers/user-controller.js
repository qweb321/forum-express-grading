const bcrypt = require('bcryptjs')
const { User } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')

const userController = {
  signUppage: (req, res) => {
    res.render('singup')
  },
  signUp: (req, res, next) => {
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
      .then(() => {
        req.flash('success_messages', '成功註冊帳號！')
        res.redirect('/signin')
      })
      .catch(err => next(err))
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', 'Login Successful!')
    res.redirect('/restaurants')
  },
  logOut: (req, res, next) => {
    req.flash('success_messages', 'Logout Successful!')
    req.logOut(err => {
      if (err) { return next(err) }
      res.redirect('/signin')
    })
  },
  getUser: (req, res, next) => {
    User.findByPk(req.params.id, {
      raw: true
    })
      .then(user => {
        if (!user) throw new Error("User didn't exist!")

        return res.render('users/profile', { user })
      })
      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    User.findByPk(req.params.id, {
      raw: true
    })
      .then(user => {
        if (!user) throw new Error("User didn't exist!")

        return res.render('users/edit-profile', { user })
      })
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    const { file } = req
    if (!req.body.name) throw new Error('User name is required!')

    Promise.all([
      User.findByPk(req.params.id),
      imgurFileHandler(file)
    ])
      .then(([user, filePath]) => {
        if (!user) throw new Error("User didn't exist!")

        return user.update({
          name: req.body.name,
          image: filePath || user.image
        })
      })
      .then(updateUser => {
        req.flash('success_messages', 'user was successfully to update')
        res.redirect(`/users/${updateUser.id}`)
      })
      .catch(err => next(err))
  }
}

module.exports = userController
