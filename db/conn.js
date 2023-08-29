const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
  }
);

try {
  sequelize.authenticate();
  console.log("Conectado ao banco de dados com sucesso!");
} catch (error) {
  console.log("Erro ao conectar com o banco de dados", error);
}

module.exports = sequelize;
  