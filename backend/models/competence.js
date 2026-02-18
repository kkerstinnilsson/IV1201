'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Competence extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      this.hasMany(models.CompetenceProfiile, { foreignKey: 'competence_id' });
    }
  }
  Competence.init({
    competence_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Competence',
    tableName: 'competence',
    timestamps: false
  });
  return Competence;
};