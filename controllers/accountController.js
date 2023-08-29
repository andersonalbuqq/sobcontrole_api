const Account = require("../models/account");
const User = require("../models/user");

const conn = require("../db/conn");

module.exports = class AccontController {
  static async create(req, res) {
    const id_user = req.user.id;
    let { name } = req.body;

    //validations
    if (!name) {
      res.status(422).json({
        message: "O preenchimento do nome é obrigatório!",
      });
      return;
    }

    //Format name account
    name = name.toLowerCase();
    name = name.split(" ");
    name = name.map((n) => {
      return n.charAt(0).toUpperCase() + n.slice(1);
    });
    name = name.join(" ");

    const hasAccount = await Account.findOne({
      where: { id_user, name },
    });
    if (hasAccount) {
      res.status(422).json({
        message: "Conta já existente!",
      });
      return;
    }

    const hasUser = await User.findByPk(id_user);
    if (!hasUser) {
      res.status(422).json({
        message: "Informe um usuário válido!",
      });
      return;
    }

    try {
      const account = await Account.create({
        name,
        balance: 0,
        id_user,
      });

      res.status(201).json({ account });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  static async getAccont(req, res) {
    const id = req.params.id;

    try {
      const account = await Account.findByPk(id);

      if (!account) {
        res.status(422).json({
          message: "Conta inexistente!",
        });
        return;
      }

      res.status(200).json({ account });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  static async getAllUserAccounts(req, res) {
    const id = req.user.id;

    const user = await User.findByPk(id);

    if (!user) {
      res.status(422).json({
        message: "Usuário inexistente!",
      });
      return;
    }

    try {
      const accounts = await Account.findAll({
        where: { id_user: id },
        order: [["name", "ASC"]],
      });

      if (accounts.length === 0) {
        res.status(404).json({
          message: "Usuário sem contas cadastradas!",
        });
        return;
      }

      res.status(200).json({ accounts });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  static async transfer(req, res) {
    const { origin, destiny, value } = req.body;

    const originAccount = await Account.findByPk(origin);
    if (!originAccount) {
      res.status(422).json({
        message: "Conta de origem inexistente!",
      });
      return;
    }

    const destinyAccount = await Account.findByPk(destiny);
    if (!destinyAccount) {
      res.status(422).json({
        message: "Conta de destino inexistente!",
      });
      return;
    }

    if (value < 0) {
      res.status(422).json({
        message: "Valor inválido!",
      });
      return;
    }

    const originBalance = originAccount.dataValues.balance;
    const destinyBalance = destinyAccount.dataValues.balance;

    try {
      await conn.transaction(async (t) => {
        await Account.update(
          { balance: +originBalance - value },
          { where: { id: origin }, transaction: t }
        );
        await Account.update(
          { balance: +destinyBalance + value },
          { where: { id: destiny }, transaction: t }
        );
      });

      res.status(200).json({ message: "Transferência realizada com sucesso!" });
    } catch (error) {
      res.status(500).json({ message: "Falha na Transferência!", error });
    }
  }

  static async update(req, res) {
    const user_id = req.user.id;
    const account_id = req.params.id;
    let { name } = req.body;

    if (!name) {
      res.status(422).json({
        message: "O nome é obrigatório!",
      });
      return;
    }

    //Format name account
    name = name.toLowerCase();
    name = name.split(" ");
    name = name.map((n) => {
      return n.charAt(0).toUpperCase() + n.slice(1);
    });
    name = name.join(" ");

    const account = await Account.findByPk(account_id);
    if (!account) {
      res.status(404).json({
        message: "Conta inexistente!",
      });
      return;
    }

    if (+account.dataValues.id_user !== +user_id) {
      res.status(401).json({
        message: "Conta pertence a outro usuário!",
      });
      return;
    }

    try {
      await Account.update(
        {
          name,
        },
        { where: { id: account_id } }
      );
      res.status(200).json({ message: "Atualizado com sucesso!" });
    } catch (error) {
      console.log(error);
    }
  }

  static async delete(req, res) {
    const id = req.params.id;

    try {
      const account = await Account.findByPk(id);

      if (!account) {
        res.status(422).json({
          message: "Conta inexistente!",
        });
        return;
      }

      await Account.destroy({ where: { id } });
      res.status(200).json({ message: "Conta excluida com sucesso!" });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
};
