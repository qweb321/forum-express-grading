const { ReserveInfo, Table, AvailableTime } = require('../../models')

const reserveInfoController = {
  putAvailableTime: (req, res, next) => {
    const { availableTime, isAvailable } = req.body
    AvailableTime.findByPk(req.params.id)
      .then(time => {
        if (!time) throw new Error("This available time didn't exist!")
        return time.update({
          time: availableTime,
          isAvailable: isAvailable === 'on'
        })
      })
      .then(() => {
        req.flash('success_messages', 'Time already update!')
        res.redirect('back')
      })
      .catch(err => next(err))
  },
  postAvailableTime: (req, res, next) => {
    console.log(req.params.id)
    console.log(req.body)
    const restaurantId = req.params.id
    const { availableTime, isAvailable } = req.body
    if (!availableTime) throw new Error('Available time is required')
    AvailableTime.findAll({
      where: {
        time: availableTime
      },
      raw: true
    })
      .then(time => {
        if (time.length) throw new Error('This time already setup!')

        return AvailableTime.create({
          restaurantId,
          time: availableTime,
          isAvailable: isAvailable === 'on'
        })
      })
      .then(() => {
        req.flash('success_messages', 'New time created successfully')
        res.redirect(`/admin/restaurants/${restaurantId}`)
      })
      .catch(err => next(err))
  },
  postTable: (req, res, next) => {
    console.log(req.params.id)
    console.log(req.body)
    const restaurantId = req.params.id
    const { tableName, capacity } = req.body
    if (!tableName || !capacity) throw new Error('Name and capacity is required')
    return Table.findAll({
      where: {
        name: tableName
      },
      raw: true
    })
      .then(table => {
        if (table.length) throw new Error('This table name already setup!')

        return Table.create({
          restaurantId,
          name: tableName,
          capacity
        })
      })
      .then(() => {
        req.flash('success_messages', 'New Table created successfully')
        res.redirect(`/admin/restaurants/${restaurantId}`)
      })
      .catch(err => next(err))
  },
  putTable: (req, res, next) => {
    const { tableName, capacity } = req.body
    Table.findByPk(req.params.id)
      .then(table => {
        if (!table) throw new Error('This table is not exist!')

        return table.update({
          name: tableName,
          capacity
        })
      })
      .then(() => {
        req.flash('success_messages', 'Table already update!')
        res.redirect('back')
      })
      .catch(err => next(err))
  }
}

module.exports = reserveInfoController
