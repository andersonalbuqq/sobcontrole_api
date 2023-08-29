const router = require("express").Router();

const auth = require("../helpers/auth");

const TransactionController = require("../controllers/transactionController");

router.post("/create", auth, TransactionController.create);
router.get("/:id", auth, TransactionController.getTransaction);
router.get("/all/:id", auth, TransactionController.getAllTransacions);
router.put("/:id", auth, TransactionController.update)
router.delete("/:id", auth, TransactionController.delete);

module.exports = router;