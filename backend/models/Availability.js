import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';
import Person from './Person.js';

/**
 * @typedef {Object} AvailabilityAttributes
 * @property {number} availability_id - primary key ("generated always as identity")
 * @property {number|null} person_id - foreign key to 'person' table
 * @property {string|null} from_date - start date of availability
 * @property {string|null} to_date - end date of availability
 */

/**
 * Availability model for managing the availability of persons in the system
 * Represents the periods during which a person is available for work
 */
const Availability = sequelize.define('availability', {
    availability_id: {
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
    from_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    to_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
}, {
    tableName: 'availability', // Explicit definition of table name
    timestamps: false  // Disables the automatic 'createdAt' and 'updatedAt' columns
});

/**
 * Relations between models 'Availability' and 'Person'
 * A person can have many availability records
 * and an availability record belongs to one person
 */
Person.hasMany(Availability, { foreignKey: 'person_id' });
Availability.belongsTo(Person, { foreignKey: 'person_id' });

export default Availability;