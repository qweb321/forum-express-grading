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
  }
}

module.exports = reserveInfoController
