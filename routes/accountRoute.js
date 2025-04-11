// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require('../utilities/account-validation');

// Deliver login view

// Default account management view
router.get("/", 
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
);

// Login and Register routes
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));

router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData, 
  utilities.handleErrors(accountController.registerAccount)
);

router.post(
  "/login",
  regValidate.loginValidation,
  regValidate.checkLogData,
  utilities.handleErrors(accountController.accountLogin)
);

// GET route for displaying the account update form
router.get("/update", 
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountUpdate)
);

// POST route for updating account info
router.post(
  "/update",
  utilities.checkLogin,
  utilities.handleErrors(accountController.updateAccountInfo)
);

// GET route for displaying the password change form
router.get("/change-password", 
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildChangePassword)
);

// POST route for handling password change
router.post(
  "/change-password",
  utilities.checkLogin,
  utilities.handleErrors(accountController.changePassword)
);

router.get("/logout", accountController.logoutAccount)


module.exports = router;