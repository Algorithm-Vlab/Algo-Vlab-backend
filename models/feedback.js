// This file contains the schema for the feedbacks given by the users to the algorithms
//Importing required modules
const mongoose = require("mongoose");

//Creating the schema for the feedback
const feedbackSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    institute: {type: String, required: true},
    department: { type: String, required: true },
    designation: { type: String, required: true },
    dateP: { type: String, required: true },
    algoName: { type: String, required: true },
    q1: { type: String, required: true },
    q2: { type: String, required: true },
    q3: { type: String, required: true },
    q4: { type: String, required: true },
    q5: { type: String, required: true },
    q6: { type: String },
    q7: { type: String }
}, {
    timestampes: { createdAt: 'createdDate', updatedAt: 'updatedDate' }
});
//Creating the feedback model
const feedback = mongoose.model("Feedback", feedbackSchema);
//Exporting the feedback model
module.exports = feedback;