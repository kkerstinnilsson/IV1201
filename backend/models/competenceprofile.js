'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CompetenceProfile extends Model {
    /**
     * Helper method for defining associations
     */
    static associate(models) {
      this.belongsTo(models.Person, { 
        foreignKey: 'person_id',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' 
      });
      this.belongsTo(models.Competence, { 
        foreignKey: 'competence_id', 
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    }
  }
  CompetenceProfile.init({
    competence_profile_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, 
      allowNull: false
    },
    person_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'person',
        key: 'person_id'
      },
    }, 
    competence_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'competence',
        key: 'competence_id'
      },
    },
    years_of_experience: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'CompetenceProfile',
    tableName: 'competence_profile',
    timestamps: false
  });
  return CompetenceProfile;
};