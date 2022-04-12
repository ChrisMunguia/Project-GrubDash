const path = require("path");
// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

//function to check if a body property is present
function bodyHasProperty(property) {
	return function validateProperty(req, res, next) {
		const { data = {} } = req.body;
		if (data[property] && data[property] !== "") {
			return next();
		}
		next({ status: 400, message: `Dish must include a ${property}` });
	};
}

//function to check if a valid price is in the req.body
function hasValidPrice(req, res, next) {
	const { data: { price } = {} } = req.body;
	if (Number(price) > 0 && Number.isInteger(price)) {
		return next();
	}
	next({ status: 400, message: `Dish must have a price that is an integer greater than 0` });
}

//function to check if a dish with the id from route exists
function dishExists(req, res, next) {
	const { dishId } = req.params;
	const foundDish = dishes.find((dish) => dish.id == dishId);

	if (foundDish) {
		res.locals.dish = foundDish;
		return next();
	}

	next({ status: 404, message: `Dish does not exist: ${dishId}` });
}

//function to validate the id from route is matching the id from the req.body
function hasValidId(req, res, next) {
	const { dishId } = req.params;
	const { data: { id } = {} } = req.body;
	if (id) {
		if (id === dishId) {
			return next();
		}

		return next({
			status: 400,
			message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
		});
	}
	next();
}

//Create a new dish
function create(req, res) {
	const { data: { name, description, price, image_url } = {} } = req.body;
	const newDish = { id: nextId(), name, description, price, image_url };
	dishes.push(newDish);
	res.status(201).json({ data: newDish });
}

//Read dish based on id
function read(req, res) {
	res.json({ data: res.locals.dish });
}

//Update dish properties
function update(req, res) {
	const dish = res.locals.dish;
	const { data: { name, description, price, image_url } = {} } = req.body;

	dish.name = name;
	dish.description = description;
	dish.price = price;
	dish.image_url = image_url;

	res.json({ data: dish });
}

//List all dishes
function list(req, res) {
	res.json({ data: dishes });
}

module.exports = {
	create: [
		bodyHasProperty("name"),
		bodyHasProperty("description"),
		bodyHasProperty("price"),
		bodyHasProperty("image_url"),
		hasValidPrice,
		create,
	],
	read: [dishExists, read],
	update: [
		dishExists,
		hasValidId,
		bodyHasProperty("name"),
		bodyHasProperty("description"),
		bodyHasProperty("price"),
		bodyHasProperty("image_url"),
		hasValidPrice,
		update,
	],
	list,
};
