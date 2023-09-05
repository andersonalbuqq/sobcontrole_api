const router = require("express").Router();

const auth = require("../helpers/auth");

const UserController = require("../controllers/userController");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/validatetoken", UserController.validateToken);
router.get("/all", UserController.getAllUsers);
router.get("/:id", UserController.getUser);
router.put("/update/:id", auth, UserController.updateUser);
router.delete("/:id", auth, UserController.delete);


module.exports = router;
