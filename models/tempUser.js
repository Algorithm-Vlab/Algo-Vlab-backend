// This file contains the schema for the temporary user who is not verified yet.
// Required Libraries
const mongoose = require("mongoose");
// Schema for the temporary user
const tuserSchema = mongoose.Schema({
    name: { type: String },
    email: { unique: true, type: String },
    username: { unique: true, type: String },
    password: { type: String },
    institute: { type: String },
    department: { type: String },
    designation: { type: String },
    isAdmin: { default: false, type: Boolean },
    isMAdmin: { default: false, type: Boolean },
    tokeng: { unique: true, type: String },
    expireT: { type: String },
    createdAt: { type: Date, expires: "30m", default: Date.now }
    // }, {
    //     timestampes: {
    //         createdAt: { type: Date, expires: "1m", default: Date.now },
    //         updatedAt: 'updatedDate'
    //     }
});

const tuser = mongoose.model("Tempuser", tuserSchema);
// Export the tuser model
module.exports = tuser;