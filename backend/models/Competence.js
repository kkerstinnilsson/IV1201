import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

/**
 * This model maps to the 'competence' table in the database
 * Represents the different types of competences/skills available
 * From sql script: 1 (ticket sales), 2 (lotteries), 3 (roller coaster operation)
 * 
 * @typedef {Object} CompetenceAttributes
 * @property {number} competence_id - primary key ("generated always as identity")
 * @property {string|null} name - "ticket sales", "lotteries", "roller coaster operator"
 */

/**
 * Competence model for managing the different types 
 * of competences/skills available in the system
 */
const Competence = sequelize.define('competence', {
    competence_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'competence', // Explicit definition of table name 
    timestamps: false // Disables the automatic 'createdAt' and 'updatedAt' columns
});

export default Competence;