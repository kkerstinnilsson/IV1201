'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('credentials', {
      credential_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      person_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { 
          model: 'person', 
          key: 'person_id' 
        },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
      },
      username: {
        type: Sequelize.STRING(255),
        unique: true,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      }
    });

    // Create 'application'
    await queryInterface.createTable('application', {
      application_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      person_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { 
          model: 'person', 
          key: 'person_id' 
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('accepted', 'rejected', 'unhandled'),
        defaultValue: 'unhandled',
        allowNull: false
      }
    });

    // Migrate existing username and password data from 'person' to 'credentials'
    await queryInterface.sequelize.query(`
      INSERT INTO credentials (person_id, username, password)
      SELECT person_id, username, password FROM person 
      WHERE username IS NOT NULL AND password IS NOT NULL;
    `);
    // Migrate existing application status data from 'person' to 'application'
    await queryInterface.sequelize.query(`
      INSERT INTO application (person_id, status)
      SELECT person_id, 'unhandled' FROM person;
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('application');
    await queryInterface.dropTable('credentials');
  }
};
