const { DataTypes } = require("sequelize");

const db = require("../db/conn");

const User = db.define("user", {
  name: {
    type: DataTypes.STRING(100),
    required: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    required: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(100),
    required: true,
    allowNull: false,
  },
});

module.exports = User