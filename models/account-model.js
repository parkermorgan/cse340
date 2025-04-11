const pool = require("../database/")


/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
      return error.message
    }
  }

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Verify login credentials
 * ********************* */

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email]
    )
    return result.rows[0]
  } catch (error) {
    throw new Error("No matching email found")  
  }
}

/// Update account info (name and email)
async function updateAccountInfo(account_email, account_firstname, account_lastname, new_account_email) {
  try {
    const sql = `
      UPDATE account
      SET account_firstname = $1, account_lastname = $2, account_email = $3
      WHERE account_email = $4
      RETURNING *`
    return await pool.query(sql, [account_firstname, account_lastname, new_account_email, account_email])
  } catch (error) {
    console.error(error.message)
    return null
  }
}

// Update password
async function updatePassword(account_email, new_password) {
  try {
    const sql = `
      UPDATE account
      SET account_password = $1
      WHERE account_email = $2
      RETURNING *`
    return await pool.query(sql, [new_password, account_email])
  } catch (error) {
    console.error(error.message)
    return null
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  updateAccountInfo,
  updatePassword
}