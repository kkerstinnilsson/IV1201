'use strict';
const { 
    Model 
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Application extends Model {
    /**
     * Helper method for defining associations
     * one application belongs to one person via the fk person_id in application
     */
    static associate(models) {
        this.belongsTo(models.Person, { 
            foreignKey: 'person_id',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
         });
    }
}
    Application.init({
        application_id: {
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
            }
        },
        status: {
            type: DataTypes.ENUM('accepted', 'rejected', 'unhandled'), // alternatively 'STRING'
            defaultValue: 'unhandled',
            allowNull: false 
        }
    }, {
    sequelize,
    modelName: 'Application',
    tableName: 'application',
    timestamps: false
});
return Application;
};