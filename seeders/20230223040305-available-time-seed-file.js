'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const restaurants = await queryInterface.sequelize.query(
      'SELECT id FROM Restaurants;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )
    const times = ['11:00', '12:00', '13:00']

    await Promise.all(restaurants.map(async restaurant => {
      await queryInterface.bulkInsert('AvailableTimes',
        times.map(time => {
          return {
            restaurant_id: restaurant.id,
            time: time,
            is_available: true,
            created_at: new Date(),
            updated_at: new Date()
          }
        }))
    }), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('AvailableTimes', {})
  }
}
