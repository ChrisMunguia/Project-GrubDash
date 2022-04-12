const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

//function to check if a body property is present
function bodyHasProperty(property) {
	return function validateProperty(req, res, next) {
		const { data = {} } = req.body;
		if (data[property] && data[property] !== "") {
			return next();
		}
		next({ status: 400, message: `Order must include a ${property}` });
	};
}

//function to check if dishes array is valid via req.body
function isDishesValid(req, res, next) {
	const { data: { dishes } = {} } = req.body;

	if (Array.isArray(dishes) && dishes.length > 0) {
		return next();
	}

	next({ status: 400, message: `Order must include at least one dish` });
}

//function to check if the quantity of each dish is valid
function hasValidQuantity(req, res, next) {
	const { data: { dishes } = {} } = req.body;

	dishes.forEach((dish, index) => {
		if (!dish.quantity || !(Number(dish.quantity) > 0) || typeof dish.quantity !== "number") {
			return next({
				status: 400,
				message: `Dish ${index} must have a quantity that is an integer greater than 0`,
			});
		}
	});

	next();
}

//function to check if the order id exists via req.body
function orderExists(req, res, next) {
	const { orderId } = req.params;
	const foundOrder = orders.find((order) => order.id == orderId);

	if (foundOrder) {
		res.locals.order = foundOrder;
		return next();
	}

	next({ status: 404, message: `Order does not exist: ${orderId}` });
}

//function to check if id from route matches id via req.body
function hasValidId(req, res, next) {
	const { orderId } = req.params;
	const { data: { id } = {} } = req.body;
	if (id) {
		if (id === orderId) {
			return next();
		}

		return next({
			status: 400,
			message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
		});
	}
	next();
}

//function to check if the status for the order is valid to be changed
function hasValidStatus(req, res, next) {
	const { data: { status } = {} } = req.body;
	const validStatus = ["pending", "preparing", "out-for-delivery"];

	validStatus.includes(status)
		? next()
		: status === "delivered"
		? next({ status: 400, message: "A delivered order cannot be changed" })
		: next({
				status: 400,
				message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
		  });
}

//function to check if order has valid status for deletion
function isStatusPending(req, res, next) {
	const status = res.locals.order.status;
	if (status && status === "pending") {
		return next();
	}
	next({ status: 400, message: "An order cannot be deleted unless it is pending" });
}

//Create a new order
function create(req, res) {
	const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
	const newOrder = { id: nextId(), deliverTo, mobileNumber, status, dishes };

	orders.push(newOrder);
	res.status(201).json({ data: newOrder });
}

//Read order based on id
function read(req, res) {
	res.json({ data: res.locals.order });
}

//Update order properties based on id
function update(req, res) {
	const order = res.locals.order;
	const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

	order.deliverTo = deliverTo;
	order.mobileNumber = mobileNumber;
	order.status = status;
	order.dishes = dishes;

	res.json({ data: order });
}

//Delete order by id with valid status
function destroy(req, res) {
	const order = res.locals.order;
	const index = orders.findIndex((ord) => ord.id === Number(order.Id));
	orders.splice(index, 1);
	res.sendStatus(204);
}

//List all orders
function list(req, res) {
	res.json({ data: orders });
}

module.exports = {
	create: [
		isDishesValid,
		hasValidQuantity,
		bodyHasProperty("deliverTo"),
		bodyHasProperty("mobileNumber"),
		bodyHasProperty("dishes"),
		create,
	],
	read: [orderExists, read],
	update: [
		orderExists,
		hasValidId,
		isDishesValid,
		hasValidQuantity,
		hasValidStatus,
		bodyHasProperty("deliverTo"),
		bodyHasProperty("mobileNumber"),
		bodyHasProperty("dishes"),
		update,
	],
	delete: [orderExists, isStatusPending, destroy],
	list,
};
