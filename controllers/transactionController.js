const Account = require("../models/account");
const User = require("../models/user");
const Transaction = require("../models/transaction");

conn = require("../db/conn");

module.exports = class TransactionController {
  static async create(req, res) {
    const { type, description, date, value, id_account } = req.body;

    //validations
    if (!type || !description || !date || !value || !id_account) {
      res.status(422).json({
        message: "O preenchimento de todos os campos é obrigatório!",
      });
      return;
    }

    if (value < 0) {
      res.status(422).json({
        message: "O valor deve ser positivo!",
      });
    }

    const accountData = await Account.findByPk(id_account);
    if (!accountData) {
      res.status(404).json({
        message: "Conta inexistente!",
      });
      return;
    }
    const balance = accountData.dataValues.balance;
    let newBalance = 0;

    if (type === "entry") {
      newBalance = +balance + +value;
    } else {
      newBalance = +balance - +value;
    }

    let newTransaction;
    try {
      await conn.transaction(async (t) => {
        newTransaction = await Transaction.create(
          {
            type,
            description,
            date,
            value,
            id_account,
          },
          { transaction: t }
        );

        await Account.update(
          { balance: newBalance },
          {
            where: {
              id: accountData.dataValues.id,
            },
            transaction: t,
          }
        );
      });
      res.status(201).json({ newTransaction });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  static async getTransaction(req, res) {
    const id = req.params.id;

    try {
      const transaction = await Transaction.findByPk(id);

      if (!transaction) {
        res.status(422).json({
          message: "Movimentação inexistente!",
        });
        return;
      }

      res.status(200).json({ transaction });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  static async getAllTransacions(req, res) {
    const id = req.params.id;
    const user = await User.findByPk(id);

    if (!user) {
      res.status(422).json({
        message: "Usuário inexistente!",
      });
      return;
    }

    const accounts = await Account.findAll({ where: { id_user: id } });

    let transactions = [];

    await Promise.all(
      accounts.map(async (account) => {
        const accountTransactions = await Transaction.findAll({
          where: { id_account: account.id },
        });
        transactions.push(...accountTransactions);
      })
    );

    transactions.map((transaction) => {
      transaction.dataValues.value = +transaction.dataValues.value;
    });

    transactions.sort((a, b) =>
      a.dataValues.date > b.dataValues.date
        ? 1
        : a.dataValues.date < b.dataValues.date
        ? -1
        : 0
    );

    res.status(200).json({ transactions });
  }

  static async update(req, res) {
    const user_id = req.user.id;
    const id = req.params.id;
    const { type, description, date, value, id_account } = req.body;

    if (!type || !description || !date || !value || !id_account) {
      res.status(422).json({
        message: "O preenchimento de todos os campos é obrigatório!",
      });
      return;
    }

    if (value < 0) {
      res.status(422).json({
        message: "O valor deve ser positivo!",
      });
    }

    const oldTransaction = await Transaction.findByPk(id);
    if (!oldTransaction) {
      res.status(404).json({
        message: "Movimentação inexistente!",
      });
      return;
    }

    const newAccount = await Account.findByPk(id_account);
    if (!newAccount) {
      res.status(404).json({
        message: "Conta inexistente!",
      });
      return;
    }

    if (+newAccount.dataValues.id_user !== +user_id) {
      res.status(401).json({
        message: "Conta pertence a outro usuário!",
      });
      return;
    }

    const oldAccount = await Account.findByPk(oldTransaction.id_account);

    let newBalanceOldAccount;
    let newBalanceNewAccount;

    if (oldTransaction.type === "exit") {
      newBalanceOldAccount = +oldAccount.balance + +oldTransaction.value;
    } else {
      console.log(oldAccount.balance);
      newBalanceOldAccount = +oldAccount.balance - +oldTransaction.value;
      console.log(newBalanceOldAccount);
    }

    if (newAccount.id === oldAccount.id) {
      if (type === "exit") {
        newBalanceNewAccount = +newBalanceOldAccount - +value;
      } else {
        newBalanceNewAccount = +newBalanceOldAccount + +value;
      }
    } else {
      if (type === "exit") {
        newBalanceNewAccount = +newAccount.balance - +value;
      } else {
        newBalanceNewAccount = +newAccount.balance + +value;
      }
    }

    try {
      await conn.transaction(async (t) => {
        await Transaction.update(
          {
            type,
            description,
            date,
            value,
            id_account,
          },
          {
            where: { id },
            transaction: t,
          }
        );
        await Account.update(
          { balance: newBalanceOldAccount },
          { where: { id: oldTransaction.id_account }, transaction: t }
        );
        await Account.update(
          { balance: newBalanceNewAccount },
          { where: { id: id_account }, transaction: t }
        );
      });

      res.status(200).json({ message: "Atualizado com sucesso!" });
    } catch (error) {
      res.status(500).json({ message: "Falha na Atualização!", error });
    }
  }

  static async delete(req, res) {
    const id = req.params.id;

    try {
      const transactionToDelete = await Transaction.findByPk(id);

      if (!transactionToDelete) {
        res.status(422).json({
          message: "Movimentação inexistente!",
        });
        return;
      }

      const account = await Account.findByPk(transactionToDelete.id_account);

      let newBalance;
      if (transactionToDelete.type === "exit") {
        newBalance = +account.balance + +transactionToDelete.value;
      } else {
        newBalance = +account.balance - +transactionToDelete.value;
      }

      await conn.transaction(async (t) => {
        await Account.update(
          { balance: newBalance },
          { where: { id: transactionToDelete.id_account }, transaction: t }
        );
        await Transaction.destroy({ where: { id }, transaction: t });
      });

      res.status(200).json({ message: "movimentação excluida com sucesso!" });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
};
