const { ReserveInfo } = require('../../models')

const reserveInfoController = {
  editReservation: (req, res, next) => {
    const { openingTime, twoSeater, fourSeater, sixSeater } = req.body
    ReserveInfo.findByPk(req.params.id)
      .then(info => {
        if (!info) throw new Error("This information didn't exist!")
        info.update({
          openingTime,
          twoSeater,
          fourSeater,
          sixSeater
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  postReservation: (req, res, next) => {
    console.log(req.params.id)
    console.log(req.body)
    const restaurantId = req.params.id
    const { openingTime, twoSeater, fourSeater, sixSeater } = req.body
    if (!openingTime) throw new Error('Time is required')
    ReserveInfo.findAll({
      where: {
        restaurantId,
        openingTime
      },
      raw: true
    })
      .then(info => {
        if (info.length) throw new Error('This time already setup!')

        return ReserveInfo.create({
          restaurantId,
          openingTime,
          twoSeater,
          fourSeater,
          sixSeater
        })
      })
      .then(() => {
        req.flash('success_messages', 'Opening Time was successfully created')
        res.redirect(`/admin/restaurants/${restaurantId}`)
      })
      .catch(err => next(err))
  }
}

module.exports = reserveInfoController
