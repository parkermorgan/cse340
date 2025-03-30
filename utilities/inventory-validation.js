const utilities = require("../utilities");
const invModel = require("../models/inventory-model");
const { body, validationResult } = require("express-validator");
const validate = {};

/* **********************************
 *  Add classification Data Validation Rules
 * ********************************* */
validate.classificationRules = () => {
  return [
    // firstname is required and must be string
    body("classification_name")
      .trim()
      .escape()
      .isAlphanumeric()
      .withMessage(" ")
      .isLength({ min: 1 })
      .withMessage("Please provide a valid classification name."), // on error this message is sent.
  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/addClassification", { // Try again
      errors,
      title: "Add Classification",
      nav,
      classification_name,
    });
    return;
  }
  next();
};

/* **********************************
 *  Add inventory Data Validation Rules
 * ********************************* */
validate.inventoryRules = () => {
  return [

    body("classification_id")
    .trim()
    .escape()
    .isInt()
    .withMessage("Please provide a classification."),

    body("inv_make")
      .trim()
      .escape()
      .isLength({ min: 1 })
      .withMessage("Please provide a make."), // on error this message is sent.

    body("inv_model")
      .trim()
      .escape()
      .isLength({ min: 1 })
      .withMessage("Please provide a model."),

    body("inv_year")
      .trim()
      .escape()
      .isNumeric()
      .withMessage("Year must be a number."),

    body("inv_description")
      .trim()
      .escape()
      .isLength({ min: 1 })
      .withMessage("Please provide a description."),

    body("inv_image")
      .trim()
      .escape()
      .isLength({ min: 1 })
      .withMessage("Please provide an image."),

    body("inv_thumbnail")
      .trim()
      .escape()
      .isLength({ min: 1 })
      .withMessage("Please provide a thumbnail."),

    body("inv_price")
      .trim()
      .escape()
      .isNumeric()
      .withMessage("Price must be a number."),

    body("inv_miles")
      .trim()
      .escape()
      .isNumeric()
      .withMessage("Miles must be a number."),

    body("inv_color")
      .trim()
      .escape()
      .isLength({ min: 1 })
      .withMessage("Please provide a color."),

  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  let errors = [];
  errors = validationResult(req);

  if (!errors.isEmpty()) {
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
    let classifications = await utilities.buildClassificationList(
      classification_id
    );
    let nav = await utilities.getNav();
    res.render("inventory/addInventory", { // Try again
      errors,
      title: "Add Inventory",
      nav,
      classifications,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });
    return;
  }
  next();
};

module.exports = validate;