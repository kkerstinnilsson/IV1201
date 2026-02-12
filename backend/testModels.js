import sequelize from './config/sequelize.js';
// Import all models to register associations in Sequelize
import Role from './models/Role.js';
import Person from './models/Person.js';
import Competence from './models/Competence.js';
import CompetenceProfile from './models/CompetenceProfile.js';
import Availability from './models/Availability.js';

/**
 * Main migration and validation script.
 * This script synchronizes the Sequelize models with the database schema.
 */
async function runMigration() {
    try {
        console.log('⏳ Starting database synchronization...');
        
        // 1. Verify database connection
        await sequelize.authenticate();
        console.log('✅ Connection to PostgreSQL has been established successfully.');

        // 2. Synchronize models with the database (MIGRATION)
        // { alter: true } checks the current state of the DB and applies changes
        // without dropping tables (unless necessary).
        await sequelize.sync({ alter: true });
        console.log('🚀 Database schema is now in sync with all models.');

        // 3. Detailed verification check
        const roleCount = await Role.count();
        console.log(`📊 Verification: Found ${roleCount} roles in the database.`);

        console.log('\n🔍 Fetching the first 5 people from the database...');
        const people = await Person.findAll({
            limit: 5,
            include: [Role] // This performs a JOIN with the Role table
        });

        people.forEach(person => {
            console.log(`- User: ${person.name} ${person.surname} | Role: ${person.role?.name || 'No Role'}`);
        });
        
    } catch (error) {
        console.error('❌ Migration failed or connection error:', error);
    } finally {
        // Close the connection gracefully
        await sequelize.close();
        console.log('🔌 Database connection closed.');
    }
}

runMigration();