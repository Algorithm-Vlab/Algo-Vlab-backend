// Initialize the nodemailer transporter
// Import the nodemailer module and create a transporter object using the createTransport method. The transporter object is used to send emails using the SMTP protocol. The createTransport method takes an object with the service and auth properties as arguments. The service property specifies the email service provider (e.g., Gmail, Yahoo, etc.), and the auth property specifies the user credentials (email and password) for the email account.   
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const retDP = require("../dirP");
var path = require("path");

// Create a transporter object for sending emails
const transporterV = nodemailer.createTransport({
    service: "yahoo",
    auth: {
        user: process.env.userE,
        pass: process.env.userP
    }
});

//  Configure the handlebars options
const handlebarOptions = {
    viewEngine: {
        partialsDir: path.resolve('./views/'),
        defaultLayout: false,
    },
    viewPath: path.resolve('./views/'),
};

// Use the handlebars options with the nodemailer transporter
transporterV.use("compile", hbs(handlebarOptions));

// Export the transporter object
module.exports = transporterV;