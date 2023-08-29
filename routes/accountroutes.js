const router = require("express").Router();

const auth = require("../helpers/auth");

const AccountController = require("../controllers/accountController");

router.post("/create", auth, AccountController.create);
router.post("/transfer", auth, AccountController.transfer);
router.get("/:id", auth, AccountController.getAccont);
router.get("/all/:id", auth, AccountController.getAllUserAccounts);
router.put("/:id", auth, AccountController.update)
router.delete("/:id", auth, AccountController.delete);

module.exports = router;
