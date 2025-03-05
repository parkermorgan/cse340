const errorController = {};

errorController.causeError = async function(req, res, next) {
    console.log("Causing an error...");
    throw new Error("This is an intentional error!");
};

module.exports = errorController;