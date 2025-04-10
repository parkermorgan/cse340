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

/**
 * Build the add classification view
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();

  res.render("inventory/addClassification", {
    title: "Add New Classification",
    nav,
    errors: null,
  });
};
/**
 * Handle post request to add a vehicle classification
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body;
  const response = await invModel.addClassification(classification_name);
  let nav = await utilities.getNav(); 
  const classifications = await utilities.buildClassificationList(); // ✅ ADD THIS

  if (response) {
    req.flash(
      "notice",
      `The "${classification_name}" classification was successfully added.`
    );
    res.render("inventory/management", {
      title: "Vehicle Management",
      errors: null,
      nav,
      classifications, // ✅ ADD THIS
      classification_name,
    });
  } else {
    req.flash("notice", `Failed to add ${classification_name}`);
    res.render("inventory/addClassification", {
      title: "Add New Classification",
      errors: null,
      nav,
      classification_name,
    });
  }
};

/**
 * Build the add inventory view
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
invCont.buildAddInventory = async function (req, res, next) {
  const nav = await utilities.getNav();
  const classifications = await utilities.buildClassificationList();

  res.render("inventory/addInventory", {
    title: "Add Vehicle",
    errors: null,
    nav,
    classifications,
  });
};

/**
 * Handle post request to add a vehicle to the inventory along with redirects
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
invCont.addInventory = async function (req, res, next) {
  const nav = await utilities.getNav();

  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  const response = invModel.addInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  );

  if (response) {
    req.flash(
      "notice",
      `The "${classification_name}" classification was successfully added.`
    );
    const classifications = await utilities.buildClassificationList();
    res.render("inventory/management", {
      title: "Vehicle Management",
      errors: null,
      nav,
      classifications,
    });
  } else {
    // This seems to never get called. Is this just for DB errors?
    req.flash("notice", "There was a problem.");
    res.render("inventory/addInventory", {
      title: "Add Vehicle",
      nav,
      errors: null,
    });
  }
};

invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classifications = await utilities.buildClassificationList();
      res.render("inventory/management", { 
          title: "Inventory Home", 
          errors: null,
          nav,
          classifications,
      });
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  let itemData = await invModel.getProductById(inv_id)
  console.log("Is itemData an array?", Array.isArray(itemData)); // Check if it's an array
  if (Array.isArray(itemData) && itemData.length > 0) {
    itemData = itemData[0]; // Access the first object if it's an array
  }

console.log(itemData); // Now check if itemData is the correct object
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

invCont.buildDeleteInventory = async function (req, res, next) {
  const inventory_id = parseInt(req.params.inventoryId);
  const nav = await utilities.getNav();

  const inventoryData = (
    await invModel.getProductById(inventory_id))[0]; // Change this function to return the first item
  const name = `${inventoryData.inv_make} ${inventoryData.inv_model}`;

  res.render("inventory/delete-confirm", {
    title: "Delete " + name,
    errors: null,
    nav,
    inv_id: inventoryData.inv_id,
    inv_make: inventoryData.inv_make,
    inv_model: inventoryData.inv_model,
    inv_year: inventoryData.inv_year,
    inv_price: inventoryData.inv_price,
  });
};




/**
 * Handle post request to delete a vehicle from the inventory along with redirects
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
invCont.deleteInventory = async function (req, res, next) {
  const nav = await utilities.getNav();
  const inventory_id = parseInt(req.body.inv_id);
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
  } = req.body;

  const queryResponse = await invModel.deleteInventory(inventory_id);
  const itemName = `${inv_make} ${inv_model}`;

  if (queryResponse) {
    // const itemName = queryResponse.inv_make + " " + queryResponse.inv_model;
    req.flash("notice", `The ${itemName} was successfully deleted.`);
    res.redirect("/inv/");
  } else {
    // const classifications = await utilities.buildClassificationList(
    //   classification_id
    // );

    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("inventory/deleteInventory", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
    });
  }
};

const errorController = {};

errorController.causeError = async function(req, res, next) {
    console.log("Causing an error...");
    throw new Error("This is an intentional error!");
};

module.exports = errorController;

module.exports = invCont