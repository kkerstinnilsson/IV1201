/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove 'username' and 'password' columns from 'person' table
    await queryInterface.removeColumn('person', 'username');
    await queryInterface.removeColumn('person', 'password');
  },

  async down(queryInterface, Sequelize) {
    /**
     * In case of rollback add 'username' and 'password'
     * columns back to 'person' table
     * but the data will be lost
     */
    await queryInterface.addColumn('person', 'username', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('person', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
