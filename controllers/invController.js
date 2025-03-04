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
 *  Build individual product page
 * ************************** */
invCont.buildById = async function (req, res, next) {
  const inv_id = req.params.inv_id;
  const data = await invModel.getProductById(inv_id);
  
  if (data.length === 0) {
    res.status(404).render("error", { title: "Product Not Found", message: "The requested product could not be found." });
    return;
  }
  
  const grid = await utilities.buildProductPage(data);
  let nav = await utilities.getNav();
  const { inv_year, inv_make, inv_model } = data[0];

  res.render("./inventory/product", {
    title: `${inv_year} ${inv_make} ${inv_model}`,
    nav,
    grid,
  });
};

module.exports = invCont