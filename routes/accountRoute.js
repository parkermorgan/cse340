// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

// Deliver login view

// Default account management view
router.get("/", 
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)

router.get("/login", utilities.handleErrors(accountController.buildLogin))

router.get("/register", utilities.handleErrors(accountController.buildRegister))

router.post(
    "/register",
    regValidate.registrationRules(),
    regValidate.checkRegData, 
    utilities.handleErrors(accountController.registerAccount)
  )

  router.post(
    "/login",
    regValidate.loginValidation,
    regValidate.checkLogData,
    utilities.handleErrors(accountController.accountLogin)
  )



module.exports = router;