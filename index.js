// This is index.js file of the backend. It is the entry point of the backend application. It is the first file that gets executed when the application starts.

// Required Libraries
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/connectDB");
const userRoutes = require("./routes/userR");
const adminRoutes = require("./routes/adminR");
const cors = require("cors");
const path = require("path");

// Initialize express app
const app = express();
const port = 5013;
// Use the required libraries
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors({ credentials: true, origin: "https://algo-vlab.kjsieit.com" }));
connectDB();
// Define the routes
app.get("/dbdb/yo", () => {

})
app.use("/y/user", userRoutes);
app.use("/y/admin", adminRoutes);

app.get("/", (req, res) => {
    res.send("Hello User " + process.env.frontEndLink + " yoo");
})

//  Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
