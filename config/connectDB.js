const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
        });
        console.log("Database connected");
    }
    catch (err) {
        console.log("Error");
    }
}

module.exports = connectDB;