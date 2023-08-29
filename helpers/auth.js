const jwt = require("jsonwebtoken");

const config = process.env;

const checkToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    res
    .status(403)
    .json({ message: "Um token é necessário para autenticação!" });
    return;
  }
  
  try {
    const verified = jwt.verify(token, config.TOKEN_KEY);
    req.user = verified;
  } catch (error) {
    return res.status(401).json({ message: "Token inválido!" });
  }
  next();
};

module.exports = checkToken;
