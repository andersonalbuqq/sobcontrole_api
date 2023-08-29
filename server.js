const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const conn = require("./db/conn");
const userRoutes = require("./routes/userroutes");
const accountRoutes = require("./routes/accountroutes")
const transactionRoutes = require("./routes/transactionroutes")

const port = process.env.PORT || 5000;

// app.use(cors({ credentials: true, origin: 'http://localhost:3000'}))
app.use(cors({ credentials: true}))

//Config JSON response
app.use(express.json());

app.use("/user", userRoutes);
app.use("/account", accountRoutes);
app.use("/transaction", transactionRoutes);

conn
  .sync()
  // .sync({force: true})
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor rodando na porta: ${port}`);
    });
  })
  .catch((error) => console.log(error));
