'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      username: {
        type: Sequelize.STRING(32),
        allowNull: true,
        unique: true
      },
      password_hash: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(256),
        allowNull: true,
        unique: true
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

    // await queryInterface.addIndex('users', ['username'], {
    //   name: 'username',
    //   unique: true,
    //   using: 'BTREE'
    // });

    // await queryInterface.addIndex('users', ['email'], {
    //   name: 'email',
    //   unique: true,
    //   using: 'BTREE'
    // });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};