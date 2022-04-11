const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./dishes.controller");

//Route reading and updating via dishId
router.route("/:dishId").get(controller.read).put(controller.update).all(methodNotAllowed);

//Route creating a dish and showing list of dishes
router.route("/").post(controller.create).get(controller.list).all(methodNotAllowed);

module.exports = router;
