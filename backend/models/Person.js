import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';
import Role from './Role.js';

/**
 * This model maps to the 'person' table in the database
 * Represents individuals in the system, either recruiters or applicants
 * From sql script: role_id 1 for recruiters, role_id 2 for applicants
 * 
 * @typedef {Object} PersonAttributes
 * @property {number} person_id - primary key ("generated always as identity")
 * @property {string|null} name - first name
 * @property {string|null} surname - last name
 * @property {string|null} pnr - personal identity number
 * @property {string|null} email - email address
 * @property {string|null} password - password
 * @property {number|null} role_id - foreign key to model 'Role'
 * @property {string|null} username - unique login name
 */

/***
 * Person model for managing user information and authentication
 */
const Person = sequelize.define('person', {
    person_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    
    name: { type: DataTypes.STRING(255), allowNull: true },
    surname: { type: DataTypes.STRING(255), allowNull: true },
    pnr: { type: DataTypes.STRING(255), allowNull: true },
    email: { type: DataTypes.STRING(255), allowNull: true },
    password: { type: DataTypes.STRING(255), allowNull: true },
    
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'role',
            key: 'role_id'
        }
    },
    username: { type: DataTypes.STRING(255), allowNull: true }
}, {
    tableName: 'person', // Explicit definition of table name 
    timestamps: false // Disables the automatic 'createdAt' and 'updatedAt' columns
});

// Relations between models 'Person' and 'Role'
Person.belongsTo(Role, { foreignKey: 'role_id' }); // a person in the system has one role 
Role.hasMany(Person, { foreignKey: 'role_id' }); // a role can be assigned to many people in the system

export default Person;