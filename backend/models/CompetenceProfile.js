import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';
import Person from './Person.js';
import Competence from './Competence.js';

/**
 * This model maps to the 'competence_profile' table in the database
 * Represents the association between a person and their competences 
 * and their years of experience
 * 
 * @typedef {Object} CompetenceProfileAttributes
 * @property {number} competence_profile_id - primary key ("generated always as identity")
 * @property {number|null} person_id - foreign key to 'person' table
 * @property {number|null} competence_id - foreign key to 'competence' table
 * @property {number|null} years_of_experience - experience in years for the given competence
 */

/**
 * CompetenceProfile model for managing 
 * the association between a person, their competences 
 * and their years of experience
 */
const CompetenceProfile = sequelize.define('competence_profile', {
    competence_profile_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    person_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'person', key: 'person_id' }
    },
    competence_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'competence', key: 'competence_id' }
    },
    years_of_experience: {
        type: DataTypes.NUMERIC(4, 2),
        allowNull: true
    }
}, {
    tableName: 'competence_profile', // Explicit definition of table name
    timestamps: false // Disables the automatic 'createdAt' and 'updatedAt' columns
});

/**
 * Relations between models 'CompetenceProfile', 'Person', and 'Competence'
 * A person can have many competence profiles, and a competence profile belongs to one person
 * A competence can be associated with many competence profiles, and a competence profile belongs to one competence
 */
Person.hasMany(CompetenceProfile, { foreignKey: 'person_id' }); 
CompetenceProfile.belongsTo(Person, { foreignKey: 'person_id' });

Competence.hasMany(CompetenceProfile, { foreignKey: 'competence_id' });
CompetenceProfile.belongsTo(Competence, { foreignKey: 'competence_id' });

export default CompetenceProfile;