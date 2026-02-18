'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Person extends Model {
    /**
     * Helper method for defining associations
     */
    static associate(models) {
      this.belongsTo(models.Role, { 
        foreignKey: 'role_id',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
       });
      this.hasOne(models.Application, { foreignKey: 'person_id' });
      this.hasOne(models.Credentials, { foreignKey: 'person_id' });
      this.hasMany(models.CompetenceProfile, { foreignKey: 'person_id' });
      this.hasMany(models.Availability, { foreignKey: 'person_id' });
    }
  }
  Person.init({
    person_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pnr: {
      type: DataTypes.STRING,
       allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'role',
        key: 'role_id'
      }
    }
  }, {
    sequelize,
    modelName: 'Person', 
    tableName: 'person',
    timestamps: false
  });
  return Person;
};