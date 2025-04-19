// File is used to authenticate user using jwt token

// Required Libraries
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Function to authorize the user
const authorize = async (req, res, next) => {
    if (req.headers.cookie) {
        // Extract the token from the cookie
        var token = req.headers.cookie.split("ttoken=")[1];
        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decodedToken.id).select("-password");
            next();
        } catch (error) {
            res.status(402).json({ "error": ["Some error occured while authenticating user"] })
        }
    }
    else {
        res.status(402).json({ "error": ["You are not authorized"] });
    }
}

// Export the authorize function
module.exports = authorize;

