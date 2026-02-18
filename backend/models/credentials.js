'use strict';
const { 
   Model 
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Credentials extends Model {
    /**
     * Helper method for defining associations
     * credentials belongs to one person via the fk person_id in credentials
     */
    static associate(models) {
        this.belongsTo(models.Person, { 
            foreignKey: 'person_id',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });
    }
}
 Credentials.init({
    credential_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false 
    },
    person_id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,  
        references: {
            model: 'person',
            key: 'person_id'
        }
    },
    username: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false
    },
    password: { // to be hashed?
        type: DataTypes.STRING(255),
        allowNull: false
    }
    }, {
    sequelize,
    modelName: 'Credentials',
    tableName: 'credentials',
    timestamps: false
});
return Credentials;
};