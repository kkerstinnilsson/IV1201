const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Availability extends Model {
    /**
     * Helper method for defining associations
     * one availability belongs to one person via the fk person_id in availability
     */
    static associate(models) {
      this.belongsTo(models.Person, {
        foreignKey: 'person_id,',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    }
  }
  Availability.init({
    availability_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    person_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'person',
        key: 'person_id',
      },
    },
    from_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    to_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Availability',
    tableName: 'availability',
    timestamps: false,
  });
  return Availability;
};
