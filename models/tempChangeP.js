//  Used to store the temporary password change token for the user
// Required Libraries
const mongoose = require("mongoose");
// Import the mongoose module to create a schema for the temporary password change token. The schema contains the email and tokenForPass fields. The email field is unique and of type String. The tokenForPass field is unique and of type String. The createdAt field is of type Date and expires in 30 minutes. The default value of the createdAt field is the current date and time.
const changeUserPSchema = mongoose.Schema({
    email: { unique: true, type: String },
    tokenForPass: { unique: true, type: String },
    createdAt: { type: Date, expires: "30m", default: Date.now }
});
// Create the TempPass model using the schema
const TempPass = mongoose.model("TempPass", changeUserPSchema);
// Export the TempPass model
module.exports = TempPass;