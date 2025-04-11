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
  const accountEmail = res.locals.accountData.account_email
  const updatedAccountData = await accountModel.getAccountByEmail(accountEmail)

  res.render("account/management", {
    title: "Account Management",
    nav,
    accountFirstname: updatedAccountData.account_firstname,
    accountLastname: updatedAccountData.account_lastname,
    accountEmail: updatedAccountData.account_email,
    accountId: updatedAccountData.account_id,
    accountType: updatedAccountData.account_type
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

/* ****************************************
 * Build Account Update View
 **************************************** */
async function buildAccountUpdate(req, res, next) {
  let nav = await utilities.getNav()
  const accountFirstname = res.locals.accountData.account_firstname
  const accountLastname = res.locals.accountData.account_lastname
  const accountEmail = res.locals.accountData.account_email

  res.render("account/update", {
    title: "Update Account",
    nav,
    accountFirstname,
    accountLastname,
    accountEmail,
  })
}

/* ****************************************
 * Update Account Info
 **************************************** */
async function updateAccountInfo(req, res, next) {
  const { account_firstname, account_lastname, account_email } = req.body
  let nav = await utilities.getNav()

  try {
    const updateResult = await accountModel.updateAccountInfo(
      res.locals.accountData.account_email, 
      account_firstname, 
      account_lastname, 
      account_email
    )

    if (updateResult) {

      const updatedAccount = await accountModel.getAccountByEmail(account_email)
      delete updatedAccount.account_password

   
      const accessToken = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })

  
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }

      req.flash("notice", "Your account information has been updated successfully.")
      res.redirect("/account/")
    } else {
      req.flash("notice", "There was an error updating your account.")
      res.status(500).render("account/update", {
        title: "Update Account",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
    }
  } catch (error) {
    req.flash("notice", "An error occurred while updating your account.")
    res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

/* ****************************************
 * Build Change Password View
 **************************************** */
async function buildChangePassword(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/change-password", {
    title: "Change Password",
    nav,
  })
}

/* ****************************************
 * Change Password
 **************************************** */
async function changePassword(req, res, next) {
  const { current_password, new_password, confirm_password } = req.body
  let nav = await utilities.getNav()

  // Check if new passwords match
  if (new_password !== confirm_password) {
    req.flash("notice", "New passwords do not match.")
    return res.status(400).render("account/change-password", {
      title: "Change Password",
      nav,
    })
  }

  const email = res.locals.accountData.account_email;
  const accountData = await accountModel.getAccountByEmail(email);

  console.log("accountData:", accountData);  // Log the account data to check its contents
  try {
    // Check current password
    if (await bcrypt.compare(current_password, accountData.account_password)) {
      const hashedNewPassword = await bcrypt.hash(new_password, 10)
      
      const updateResult = await accountModel.updatePassword(accountData.account_email, hashedNewPassword)

      if (updateResult) {
        req.flash("notice", "Your password has been updated successfully.")
        res.redirect("/account/")
      } else {
        req.flash("notice", "Error updating your password.")
        res.status(500).render("account/change-password", {
          title: "Change Password",
          nav,
        })
      }
    } else {
      req.flash("notice", "Current password is incorrect.")
      res.status(400).render("account/change-password", {
        title: "Change Password",
        nav,
      })
    }
  } catch (error) {
    console.error("Error changing password:", error);  // Log the error to see its details
    req.flash("notice", "An error occurred while changing your password.");
    res.status(500).render("account/change-password", {
      title: "Change Password",
      nav,
    });
  }
  
}

function logoutAccount(req, res) {
  res.clearCookie("jwt") // Clear the JWT cookie
  req.flash("notice", "You have been logged out.")
  res.redirect("/") // Or redirect to /account/login or wherever you want
}


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildChangePassword, changePassword, updateAccountInfo, buildAccountUpdate, logoutAccount } 