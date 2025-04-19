// This file contains the schema for the user model

// Required Libraries
const mongoose = require("mongoose");
// Schema for the user
const userSchema = mongoose.Schema({
    name: { type: String },
    email: { unique: true, type: String },
    username: { unique: true, type: String },
    password: { type: String },
    institute: { type: String },
    department: { type: String },
    designation: { type: String },
    algoPerformed: [{ type: String }],
    isAdmin: { default: false, type: Boolean },
    isMAdmin: { default: false, type: Boolean },
}, {
    timestampes: { createdAt: 'createdDate', updatedAt: 'updatedDate' }
});
//  Create the user model using the schema
const user = mongoose.model("User", userSchema);
// Export the user model
module.exports = user;