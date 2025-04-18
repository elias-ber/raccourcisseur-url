'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('visits', {
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      link_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'links',
          key: 'id'
        }
      },
      visited_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      country: {
        type: Sequelize.CHAR(2),
        allowNull: true
      },
    });

    // await queryInterface.addIndex('visits', ['link_id'], {
    //   name: 'FK_visits_links',
    //   using: 'BTREE'
    // });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('visits');
  }
};