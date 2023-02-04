const bcrypt = require('bcryptjs')
const { User, Comment, Restaurant, Favorite, Like, Followship } = require('../models')
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
    const loginUser = req.user
    Promise.all([
      User.findByPk(req.params.id, {
        raw: true,
        nest: true
      }),
      Comment.findAndCountAll({ where: { userId: req.params.id }, include: Restaurant, raw: true, nest: true })
    ])
      .then(([user, comments]) => {
        if (!user) throw new Error("User didn't exist!")

        return res.render('users/profile', { user, comments, loginUser })
      })
      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    if (req.user.id !== Number(req.params.id)) return res.redirect(`/users/${req.params.id}`)
    // check if loginUser and requestUser is same

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
  },
  addFavorite: (req, res, next) => {
    const { restaurantId } = req.params
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Favorite.findOne({
        where: {
          userId: req.user.id,
          restaurantId
        }
      })
    ])
      .then(([restaurant, favorite]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        if (favorite) throw new Error('You have favorited this restaurant!')

        return Favorite.create({
          userId: req.user.id,
          restaurantId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFavorite: (req, res, next) => {
    return Favorite.findOne({
      where: {
        userId: req.user.id,
        restaurantId: req.params.restaurantId
      }
    })
      .then(favorite => {
        if (!favorite) throw new Error("You haven't favorited this restaurant")

        return favorite.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  addLike: (req, res, next) => {
    const { restaurantId } = req.params

    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Like.findOne({
        where: {
          userId: req.user.id,
          restaurantId
        }
      })
    ])
      .then(([restaurant, like]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        if (like) throw new Error('You have liked this restaurant!')

        return Like.create({
          restaurantId,
          userId: req.user.id
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeLike: (req, res, next) => {
    return Like.findOne({
      where: {
        userId: req.user.id,
        restaurantId: req.params.restaurantId
      }
    })
      .then(like => {
        if (!like) throw new Error("You haven't like this restaurant!")

        return like.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  getTopUsers: (req, res, next) => {
    // 撈出所有 User 與 followers 資料
    return User.findAll({
      include: [{ model: User, as: 'Followers' }]
    })
      .then(users => {
        // 整理 users 資料，把每個 user 項目都拿出來處理一次，並把新陣列儲存在 users 裡
        const result = users.map(user => ({
          // 整理格式
          ...user.toJSON(),
          // 計算追蹤者人數
          followerCount: user.Followers.length,
          // 判斷目前登入使用者是否已追蹤該 user 物件
          isFollowed: req.user.Followings.some(f => f.id === user.id)
        }))
          .sort((a, b) => b.followerCount - a.followerCount)
        res.render('top-users', { users: result })
      })
      .catch(err => next(err))
  },
  addFollowing: (req, res, next) => {
    const { userId } = req.params

    return Promise.all([
      User.findByPk(userId),
      Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: userId
        }
      })
    ])
      .then(([user, follower]) => {
        if (!user) throw new Error("User didn't exist!")
        if (follower) throw new Error('You already following this user!')

        return Followship.create({
          followerId: req.user.id,
          followingId: userId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFollowing: (req, res, next) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then(user => {
        if (!user) throw new Error("You haven't followed this user!")
        return user.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  }
}

module.exports = userController
