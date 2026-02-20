'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations
     * roles can be assigned to many persons via the fk role_id in person
     */
    static associate(models) {
      this.hasMany(models.Person, { foreignKey: 'role_id' });
    }
  }   
  Role.init({
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
    sequelize,
    modelName: 'Role', // added tableName 'role', removed timestamps defined in migrations
    tableName: 'role',
    timestamps: false
  });
  return Role;
};