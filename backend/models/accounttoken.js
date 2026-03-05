
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AccountToken extends Model {
    static associate(models) {
      this.belongsTo(models.Person, { foreignKey: 'person_id' });
    }
  }

  AccountToken.init(
    {
      account_token_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      person_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      token_hash: { type: DataTypes.STRING, allowNull: false },
      expires_at: { type: DataTypes.DATE, allowNull: false },
      used_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: 'AccountToken',
      tableName: 'account_token',
      timestamps: true,
    }
  );

  return AccountToken;
};