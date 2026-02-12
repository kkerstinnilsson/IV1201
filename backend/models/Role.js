import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

/**
 * This model maps to the 'role' table in the database
 * Represents the roles recruiter or applicant
 * From sql script: role_id 1 for recruiters, role_id 2 for applicants
 * @module Role
 * @typedef {Object} RoleAttributes
 * @property {number} role_id - primary key ("generated always as identity")
 * @property {string|null} name - the name of the role (max 255 characters).
 */

/**
 * Role model for managing user permissions and titles
 */
const Role = sequelize.define('role', {
    role_id: {
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
    
    tableName: 'role', // Explicit definition of table name 
    timestamps: false // Disables the automatic 'createdAt' and 'updatedAt' columns
});

export default Role;