const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach(vehicle => { 
      grid += '<li>';
      grid += '<a href="../../inv/detail/' + vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model 
        + ' details"><img src="' + vehicle.inv_thumbnail 
        + '" srcset="' + vehicle.inv_thumbnail + ' 480w, ' + vehicle.inv_image + ' 1024w" ' 
        + 'sizes="(max-width: 600px) 480px, 1024px" ' 
        + 'alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model 
        + ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += '<hr />';
      grid += '<h2>';
      grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';
      grid += '</h2>';
      grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
      grid += '</div>';
      grid += '</li>';
    });
    grid += '</ul>';
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
}

/* **************************************
* Build the product view HTML
* ************************************ */
Util.buildProductPage = async function(data) {
  let productHtml;
  if (data.length > 0) {
    const product = data[0];
    productHtml = `
      <div class="product-grid">
        <div class="product-img">
          <img src="${product.inv_image}" alt="Image of ${product.inv_make} ${product.inv_model} on CSE Motors">
        </div>
        <div class="product-info">
          <p><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(product.inv_price)}</p>
          <p><strong>Description:</strong> ${product.inv_description}</p>
          <p><strong>Color:</strong> ${product.inv_color}</p>
          <p><strong>Mileage:</strong> ${product.inv_miles.toLocaleString()} miles</p>
          <a href="/inv/type/${product.classification_id}" class="back-link">View more in this category</a>
        </div>
      </div>
    `;
  } else {
    productHtml = '<p class="notice">Sorry, the requested vehicle could not be found.</p>';
  }
  return productHtml;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util