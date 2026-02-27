const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = 12;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const credentials = await queryInterface.sequelize.query(
      'SELECT credential_id, password FROM credentials',
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    for (const credential of credentials) {
      const isHashed = credential.password.startsWith('$2b$') && credential.password.length === 60;

      if (!isHashed) {
        const hashed = await bcrypt.hash(credential.password, BCRYPT_ROUNDS);

        await queryInterface.sequelize.query(
          'UPDATE credentials SET password = ? WHERE credential_id = ?',
          { replacements: [hashed, credential.credential_id] },
        );
      }
    }
  },
  async down(queryInterface, Sequelize) {
    // Hashing is one-way and cannot be reversed
  },
};
