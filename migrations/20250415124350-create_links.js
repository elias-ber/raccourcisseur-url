'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('links', {
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      short_id: {
        type: Sequelize.CHAR(32),
        allowNull: true,
        unique: true
      },
      redirection: {
        type: Sequelize.STRING(4080),
        allowNull: true
      },
      password_hash: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      expirated_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: {
        type: Sequelize.TINYINT,
        allowNull: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // await queryInterface.addIndex('links', ['short_id'], {
    //   name: 'short_id',
    //   unique: true,
    //   using: 'BTREE'
    // });

    // await queryInterface.addIndex('links', ['created_by'], {
    //   name: 'FK_links_users',
    //   using: 'BTREE'
    // });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('links');
  }
};