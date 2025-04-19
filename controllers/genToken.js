// This file is used to generate token for the user when they login or register
const jwt = require("jsonwebtoken");
//  Import the jsonwebtoken module to generate a token for the user when they login or register. The token is generated using the sign method of the jwt object. The sign method takes the user id and the JWT_SECRET from the .env file as arguments. The token is set to expire in 30 days.

//  Function to generate a token for the user
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
}

// Export the generateToken function
module.exports = generateToken;