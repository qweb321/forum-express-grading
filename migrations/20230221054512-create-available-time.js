'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AvailableTimes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      restaurant_id: {
        type: Sequelize.INTEGER
      },
      time: {
        type: Sequelize.STRING
      },
      is_available: {
        type: Sequelize.BOOLEAN
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AvailableTimes')
  }
}
