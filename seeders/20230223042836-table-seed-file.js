'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const restaurants = await queryInterface.sequelize.query(
      'SELECT id FROM Restaurants;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )
    const tableName = [
      { name: 'A01', capacity: 2 },
      { name: 'A02', capacity: 2 },
      { name: 'B01', capacity: 4 },
      { name: 'B02', capacity: 4 },
      { name: 'C01', capacity: 6 }
    ]

    await Promise.all(restaurants.map(async restaurant => {
      await queryInterface.bulkInsert('Tables',
        tableName.map(table => {
          return {
            restaurant_id: restaurant.id,
            name: table.name,
            capacity: table.capacity,
            created_at: new Date(),
            updated_at: new Date()
          }
        }))
    }), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Tables', {})
  }
}
