// This file is used to connect to the database using mongoose
const mongoose = require("mongoose");

// Function to connect to the database
const connectDB = async () => {
    try {
        // Connect to the database using the DB_URL from the .env file
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
        });
        console.log("Database connected");
    }
    catch (err) {
        console.log("Error");
    }
}
// Export the connectDB function
module.exports = connectDB;