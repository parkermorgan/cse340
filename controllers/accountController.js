const utilities = require('../utilities/')
const accountModel = require('../models/account-model')
const bcrypt = require("bcryptjs")
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken")
require("dotenv").config()

async function buildLogin(req, res, next) {
    console.log("buildLogin function reached");
    let nav = await utilities.getNav()
    req.flash("notice", "")
    res.render("account/login", {
      title: "Login",
      nav,
    })
  }
  
  /* ****************************************
*  Deliver registration view
* *************************************** */ 
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }

/* ***************************
 *  Build Account Management View
 * *************************** */
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav()
  const accountFirstname = res.locals.accountData.account_firstname
  const accountLastname = res.locals.accountData.account_lastname
  const accountEmail = res.locals.accountData.account_email

  res.render("account/management", {
    title: "Account Management",
    nav,
    accountFirstname,
    accountLastname,
    accountEmail,
  })
}

    /* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
      hashedPassword = await bcrypt.hash(account_password, 10)  // Using bcrypt to hash password
  } catch (error) {
      req.flash("notice", 'Sorry, there was an error processing the registration.')
      return res.status(500).render("account/register", {
          title: "Registration",
          nav,
          errors: null,
      })
  }

  // Store the hashed password instead of plain text
  const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
  )

  if (regResult) {
      req.flash(
          "notice",
          `Congratulations, you're registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
          title: "Login",
          nav,
      })
  } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
          title: "Registration",
          nav,
      })
  }
}




/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}
module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement } 