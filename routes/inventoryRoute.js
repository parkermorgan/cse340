// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation");
const utilities = require("../utilities")

// Route middleware
router.use(["/add-classification", "/add-inventory", "/edit/:inventoryId", "/update", "/delete/:inventoryId", "/delete/",], utilities.checkLogin);
router.use(["/add-classification", "/add-inventory", "/edit/:inventoryId", "/update", "/delete/:inventoryId", "/delete/",], utilities.checkAuthorizationManager);

// Route to build inventory by classification view
router.get("/type/:classification_id", invController.buildByClassificationId);
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildById));
router.get("/cause-error", utilities.handleErrors(invController.causeError));

// Classification management routes
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));
router.post("/add-classification", invValidate.classificationRules(), invValidate.checkClassificationData, utilities.handleErrors(invController.addClassification)); // ...through the appropriate router, where server-side validation middleware is present,... 

// Inventory management routes
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));
router.post("/add-inventory", invValidate.inventoryRules(), invValidate.checkInventoryData, utilities.handleErrors(invController.addInventory));

router.get("/", async (req, res) => {
    let nav = await utilities.getNav();
    res.render("inventory/management", { 
        title: "Inventory Home", 
        nav,
        errors: null 
    });
});

// Build edit/update inventory views
router.get("/edit/:inventoryId", utilities.handleErrors(invController.buildEditInventory));
router.post("/update/", invValidate.inventoryRules(), invValidate.checkUpdateData, utilities.handleErrors(invController.updateInventory));

// Delete vehicle information routes
router.get("/delete/:inventoryId", utilities.handleErrors(invController.buildDeleteInventory));
router.post("/delete/", utilities.handleErrors(invController.deleteInventory));  // Don't need validation

// AJAX inventory api call route
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))


module.exports = router;