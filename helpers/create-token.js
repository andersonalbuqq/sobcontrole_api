const jwt = require("jsonwebtoken");

async function Createtoken(user, req, res) {
  // Create token
  const token = jwt.sign(
    {
      name: user.name,
      id: user.id,
    },
    process.env.TOKEN_KEY,
    {
      expiresIn: "2h",
    }
  );

  //return token
  res.status(201).json({
    message: "Autenticado com sucesso!",
    user,
    token,
  });
}

module.exports = Createtoken;
