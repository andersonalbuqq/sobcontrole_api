const User = require("../models/user");
const Account = require("../models/account");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = process.env;

// const passwordTest = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%!]).{6,10})/;
const passwordTest = /(?=.*[a-z])/;

const Createtoken = require("../helpers/create-token");

module.exports = class UserController {
  static async register(req, res) {
    const { name, email, password, confirmpassword } = req.body;

    //validations
    {
      if (!(name && email && password && confirmpassword)) {
        res.status(422).json({
          message: "O preenchimento de todos os camopos é obrigatório",
        });
        return;
      }

      if (!password.match(passwordTest)) {
        res.status(422).send({
          message:
            "Senha precisar ter: uma letra maiúscula, uma letra minúscula, um número, uma caractere especial(@#$%!) e tamanho entre 6-10.",
        });
        return;
      }

      if (password !== confirmpassword) {
        res.status(422).json({
          message: "A senha e a confirmação de senha precisam ser iguais.",
        });
        return;
      }

      // Validate if the user exists in the database
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        res.status(422).json({ message: "O e-mail já esta em uso!" });
        return;
      }
    }

    //Encrypt user password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    try {
      const user = await User.create({
        name,
        email,
        password: hash,
      });

      await Account.create({
        name: "Espécie",
        balance: 0,
        id_user: user.id,
      });

      Createtoken(user, req, res);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    //validations
    if (!(email && password)) {
      res
        .status(422)
        .json({ message: "Preenchimento de todos os campos é obrigatorio" });
      return;
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(404).json({ message: "Usuário não cadastrado!" });
      return;
    }

    const validPassword = bcrypt.compareSync(password, user.password);

    if (!validPassword) {
      res.status(401).json({ message: "senha inválida!" });
      return;
    }

    Createtoken(user, req, res);
  }

  static async validateToken(req, res) {
    let currentUser;
    if (!req.headers.authorization) {
      res.status(200).json({ auth: false });
      return;
    }

    try {
      const token = req.headers.authorization;
      const decoded = jwt.verify(token, config.TOKEN_KEY);

      currentUser = await User.findByPk(decoded.id);
      currentUser.password = undefined;
    } catch (error) {
      currentUser = null;
      res.status(200).json({ auth: false });
      return;
    }

    res.status(200).json({ auth: true, currentUser });
  }

  static async getUser(req, res) {
    const id = req.params.id;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      res.status(404).json({ message: "Usuário não encontrado!" });
      return;
    }
    res.status(200).json(user);
  }

  static async updateUser(req, res) {
    const id = req.params.id;
    const { name, email, password, confirmpassword } = req.body;

    //validations
    {
      if (!name) {
        res.status(422).json({ message: "O nome é obrigatorio" });
        return;
      }

      if (!email) {
        res.status(422).json({ message: "O email é obrigatorio" });
        return;
      }
      if (!password) {
        res.status(422).json({ message: "A senha é obrigatoria" });
        return;
      }

      if (!password.match(passwordTest)) {
        res.status(422).send({
          message:
            "Senha precisar ter: uma letra maiúscula, uma letra minúscula, um número, uma caractere especial(@#$%!) e tamanho entre 6-10.",
        });
        return;
      }

      if (!confirmpassword) {
        res
          .status(422)
          .json({ message: "A confirmação de senha é obrigatoria" });
        return;
      }

      if (password !== confirmpassword) {
        res.status(422).json({
          message: "A senha e a confirmação de senha precisam ser iguais.",
        });
        return;
      }

      const userExists = await User.findOne({ where: { email: email } });
      const oldUser = await User.findByPk(id);

      if (userExists && oldUser.dataValues.email != email) {
        res.status(422).json({ message: "O e-mail já esta em uso!" });
        return;
      }
    }

    //hash a password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const user = { name, email, password: hash };
    try {
      const userUpdated = await User.update(user, { where: { id: id } });
      res.status(200).json({
        message: "Usuário atualizado com sucesso!",
      });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  static async delete(req, res) {
    const id = req.params.id;

    await User.destroy({ where: { id } });
    res.status(200).json({ message: "Usuário excluido com sucesso!" });
  }
};
