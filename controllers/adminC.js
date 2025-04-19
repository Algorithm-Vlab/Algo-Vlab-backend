// This file contains the controllers for the admin functionalities.

// Required Imports
const User = require("../models/user");
const Feedback = require("../models/feedback");
const bcrypt = require("bcrypt");
const generateToken = require("./genToken");
var XLSX = require("xlsx");
const retDP = require("../dirP");
const Tempuser = require("../models/tempUser");
const nodemailer = require("nodemailer");
const TempPass = require("../models/tempChangeP");
const transporterV = require("../config/transporter");

// Function to login the admin
const LoginAdmin = async (req, res) => {
    //  Check if the email and password fields are empty
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(402).json({ error: ["Please fill all fields"] });
    }

    // Check if the user exists in the database
    try {
        const userExists = await User.findOne({ email: email, isAdmin: true });
        if (userExists) {
            if (await bcrypt.compare(password, userExists.password)) {
                try {
                    var token = generateToken(userExists._id);
                    return res
                        .status(200)
                        .cookie(
                            "ttoken", token,
                            {
                                sameSite: "strict",
                                maxAge: Number(process.env.sessionTimeMS),
                                httpOnly: true,
                            }
                        ).send("Login successfull")
                } catch (error) {
                    return res.status(402).json({ error: ["Error in saving cookies"] });
                }
            }
            else {
                return res.status(402).json({ error: ["Wrong credentials"] });
            }
        }
        else {
            return res.status(402).json({ error: ["Email id not registered"] });
        }
    } catch (error) {
        return res.status(402).json({ "error": ["Error occured, Please try again"] });
    }

}

// Function to create a random token
const createTVerf = () => {
    //  Function to create a random token
    const referStrs = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

    let token = "";
    const tCounter = Math.floor(Math.random() * 15) + 10;
    for (var i = 0; i < tCounter; i++) {
        token += referStrs[Math.floor(Math.random() * referStrs.length)];
    }
    return token;
}

// Function to register the admin
const RegisterAdmin = async (req, res) => {
    const { name, email, username, password, secretK, institute, department,
        designation } = req.body;
    if (!name || !email || !username || !password || !secretK) {
        return res.status(402).json({ error: ["Please fill all fields"] })
    }
    if (secretK != process.env.adminSecretKey) {
        return res.status(402).json({ error: ["Incorrect Secret key!"] });
    }
    const userExists = await User.findOne({ $or: [{ email: email }, { username: username }] });
    if (userExists) {
        if (userExists.email === email) {
            return res.status(422).json({ error: ["Email id already registered"] });
        }
        else if (userExists.username === username) {
            return res.status(422).json({ error: ["Username already exists"] });
        }
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //  Function to create a random token
    const genTVer = createTVerf();

    // Check if the user exists in the database
    try {
        const userReqPending = await Tempuser.findOne({ email });
        if (userReqPending) {
            return res.status(402).json({ "error": ["Verification Link has already been sent to your email"] });
        }
        var isMAdmin = false;
        if (email === process.env.admin1) {
            isMAdmin = true;
        }
        const newUser = await Tempuser.create({
            name,
            email,
            username,
            password: hashedPassword,
            institute,
            department,
            designation,
            tokeng: genTVer,
            isAdmin: true,
            isMAdmin
        });
        const mailConfigs = {
            from: `Algorithm Vlab KJSIT <${process.env.userE}>`,
            to: email,
            subject: "Verify Your Account on KJSIT Algorithm Vlab",
            template: "index1",
            context: {
                name: name, ulink: `${process.env.accountVerify}${genTVer}`,
                frontEndLink: process.env.frontEndLink,
                contentp1: "Thank you for registering in our portal",
                contentp2: "Verify your account, by clicking here!"
            },
        }

        // Send the mail
        if (newUser) {
            transporterV.sendMail(mailConfigs, async function (err, result) {
                if (err) {
                    const userDeleted = await Tempuser.deleteOne({ email });
                    return res.status(402).json({ "error": ["Error occured, Please try again"] });
                }
                else {
                    return res.status(200).send("Verification Link has been sent to your Email, expires in 30 minutes!");
                }
            });
        }
        else {
            return res.status(402).json({ "error": ["Error occured, Please try again"] });
        }
    } catch (error) {
        console.log(error);
        return res.status(402).json({ "error": ["Error occured, Please try again"] });
    }

}

// Function to fetch the feedbacks
const adminDash = async (req, res) => {
    // try and catch block to fetch the feedbacks
    try {
        const feedData = await Feedback.find({}, "-_id -__v")
            .populate("userId", "-_id -password -__v");
        // console.log(feedData);
        res.status(200).send(feedData);
    } catch (error) {
        return res.status(422).json({ error: ["Some error occurred in fetching feedbacks"] });
    }

}

//  Function to export the feedbacks
const exportEx = async (req, res) => {
    var wb = XLSX.utils.book_new();
    try {
        const feedData = await Feedback.find({}, "-_id -__v")
            .populate("userId", "-_id -password -__v");

        var newFD = [];
        feedData.map((el) => {
            const nfData = {
                "name": el.userId.name,
                "email": el.userId.email,
                "date": el.dateP,
                "institute": el.institute,
                "department": el.department,
                "designation": el.designation,
                "Algorithm": el.algoName,
                "Ease of understanding of concept using virtual lab": el.q1,
                "Simulation is easy and step by step": el.q2,
                "Relevant theory is provided for all experiments": el.q3,
                "Operating the website is easy and convenient": el.q4,
                "Any difficulties during performing the experiments?": el.q5,
                "Suggestions for further improvement": el.q6,
                "Experiment that can be added and not available in existing Algorithms VLAB.": el.q7
            }
            newFD.push(nfData);
        })
        var temp = JSON.stringify(newFD);
        temp = JSON.parse(temp);
        var ws = XLSX.utils.json_to_sheet(temp);
        var dp = retDP();
        down = dp + "\\public\\exportd.xlsx";
        XLSX.utils.book_append_sheet(wb, ws, "sheet1");
        XLSX.writeFile(wb, down);
        res.download(down);
        res.status(200).sendFile(down);
    } catch (error) {
        return res.status(422).json({ error: ["Some error occurred in downloading feedbacks"] });
    }
}

// Function to fetch the feedbacks for each user
const fetchFeedForEUser = async (userId) => {
    const feeds = await Feedback.find({ userId });
    return feeds;
}

// Function to fetch the users
const fetchUsers = async (req, res) => {
    try {
        const users = await User.find({ isAdmin: false }, "-password");
        if (users) {
            let newUL = [];
            // Fetch the feedbacks for each user
            let dd = await Promise.all(users.map(async (usI, index) => {
                var feeds = await fetchFeedForEUser(usI._id);
                var feedP = [];
                feeds.map((fe) => {
                    feedP.push(fe.algoName);
                })
                const nUsI = {
                    email: usI.email,
                    username: usI.username,
                    algoPerformed: usI.algoPerformed,
                    feedP
                }
                newUL.push(nUsI);
            }))
            if (newUL) {
                return res.status(200).send(newUL);
            }
            else {
                return res.status(402).json({ error: ["Some error occurred in fetching users!"] });
            }
            // console.log(nn);
            // return res.status(200).send(newUL);
        }
        else {
            return res.status(402).json({ error: ["Some error occurred in fetching users!"] });
        }
    } catch (error) {
        return res.status(402).json({ error: ["Some error occurred in fetching users!"] });
    }

}

// Function to fetch the admins
const fetchAdmins = async (req, res) => {
    const isM = req.user.isMAdmin;
    if (!isM) {
        return res.status(402).json({ error: ["You can't access!"] });
    }
    // Fetch the admins
    const users = await User.find({ isAdmin: true }, "-password");
    res.status(200).send(users);
}

// Export the functions
module.exports = { LoginAdmin, RegisterAdmin, adminDash, exportEx, fetchUsers, fetchAdmins }