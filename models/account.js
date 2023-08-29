const { DataTypes } = require("sequelize");

const db = require("../db/conn");

const User = require("./user");

const Account = db.define("account", {
  name: {
    type: DataTypes.STRING(100),
    required: true,
    allowNull: false,
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    required: true,
    allowNull: false,
  },
});

Account.belongsTo(User, { foreignKey: "id_user", onDelete: "CASCADE" });
User.hasMany(Account, { foreignKey: "id_user", onDelete: "CASCADE" });

module.exports = Account;
