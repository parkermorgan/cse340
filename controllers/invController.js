const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build products page
 * ************************** */

invCont.buildById = async function (req, res, next) {
  const inv_id = req.params.inv_id;
  const data = await invModel.getProductById(inv_id);
  const grid = await utilities.buildProductPage(data);
  let nav = await utilities.getNav()
  const year = data[0].inv_year;
  const make = data[0].inv_make;
  const model = data[0].inv_model;
  res.render("./inventory/classification", {
    title: year + " " + make + " " + model,
    nav,
    grid,
  });
};

module.exports = invCont