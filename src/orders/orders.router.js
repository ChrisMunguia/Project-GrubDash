const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./orders.controller");

//Route reading, updating, and deleting based on order id
router
	.route("/:orderId")
	.get(controller.read)
	.put(controller.update)
	.delete(controller.delete)
	.all(methodNotAllowed);

//Route to create and list orders
router.route("/").post(controller.create).get(controller.list).all(methodNotAllowed);

module.exports = router;
