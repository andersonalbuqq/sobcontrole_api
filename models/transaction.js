const { DataTypes } = require("sequelize");

const db = require("../db/conn");

const Account = require("./account");

const Transaction = db.define("transaction", {
  type: {
    type: DataTypes.STRING(10),
    required: true,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(150),
    required: true,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    required: true,
    allowNull: false,
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    required: true,
    allowNull: false,
  },
});

Transaction.belongsTo(Account, {
  foreignKey: "id_account",
  allowNull: false,
  onDelete: "CASCADE",
});
Account.hasMany(Transaction, { foreignKey: "id_account", onDelete: "CASCADE" });

module.exports = Transaction;
