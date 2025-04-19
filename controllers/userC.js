// This file is about the user controllers. It contains the functions for user registration, login, fetching user details, filling feedback, logging out, verifying user, requesting password change, changing password, and updating the algorithms performed by the user. The functions are exported to be used in the routes file.

// Required Imports
const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/user");
const Tempuser = require("../models/tempUser");
const Feedback = require("../models/feedback");
const bcrypt = require("bcrypt");
const generateToken = require("./genToken");
const nodemailer = require("nodemailer");
const retDP = require("../dirP");
const TempPass = require("../models/tempChangeP");
const transporterV = require("../config/transporter");

// Function to create a random token
const createTVerf = () => {
    const referStrs = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    // Down here we initialize a variable token with an empty string and a variable tCounter with a random number between 10 and 25. We then use a for loop to iterate over the tCounter value and add a random character from the referStrs string to the token variable. Finally, we return the token.
    let token = "";
    const tCounter = Math.floor(Math.random() * 15) + 10;
    for (var i = 0; i < tCounter; i++) {
        token += referStrs[Math.floor(Math.random() * referStrs.length)];
    }
    return token;
}

// Function to check if the token exists
const ttExists = async (tt) => {
    const tokenExists = await Tempuser.find({ tokeng: tt });
    return tokenExists;
}

// Function to check if the token exists
const tverExits = async (req, res) => {
    const { token } = req.body;
    // console.log(token);
    const tokenExists = await Tempuser.find({ tokeng: token });
    if (tokenExists.length > 0) {
        return res.status(200).send("Token exists!");
    }
    else {
        return res.status(422).json({ "error": ["Token doesn't exist"] });
    }
}

// Function to register a user
const RegisterUser = async (req, res) => {
    const { name, email, username, password, institute, department, designation } = req.body;
    if (!name || !email || !username || !password) {
        res.status(402).json({ error: ["Please fill all fields"] })
    }
    const userExists = await User.findOne({ $or: [{ email: email }, { username: username }] });
    const tempUExists = await Tempuser.findOne({ $or: [{ email: email }, { username: username }] });
    if (userExists) {
        if (userExists.username === username) {
            return res.status(422).json({ "error": ["Username already exists"] });
        }
        else if (userExists.email === email) {
            return res.status(422).json({ "error": ["Email id already registered"] });
        }
    }
    else if (tempUExists) {
        if (tempUExists.username === username) {
            return res.status(422).json({ "error": ["Username already exists"] });
        }
        else if (tempUExists.email === email) {
            return res.status(422).json({ "error": ["Email id already registered"] });
        }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const genTVer = createTVerf();
    // Check if the user exists in the database
    try {
        const userReqPending = await Tempuser.findOne({ email });
        if (userReqPending) {
            return res.status(402).json({ "error": ["Verification Link has already been sent to your email"] });
        }
        const newUser = await Tempuser.create({
            name,
            email,
            username,
            password: hashedPassword,
            institute,
            department,
            designation,
            tokeng: genTVer
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
        return res.status(402).json({ "error": ["Error occured, Please try again"] });
    }

}

// Function to verify the user
const finallyRegU = async (req, res) => {
    const { token } = req.body;
    const userFound = await Tempuser.findOne({ tokeng: token });

    if (userFound) {
        const userUF = await User.findOne({ _id: userFound._id });
        if (userUF) {
            return res.status(402).json({ "error": ["Link is expired"] });
        }
        else {
            await User.create({
                name: userFound.name,
                email: userFound.email,
                username: userFound.username,
                password: userFound.password,
                institute: userFound.institute,
                department: userFound.department,
                designation: userFound.designation,
                isAdmin: userFound.isAdmin,
                isMAdmin: userFound.isMAdmin
            });
            await Tempuser.deleteOne({ _id: userFound._id });
            return res.status(200).send("Your account has been successfully verified!");
        }
    }
    else {
        // res.status(402).json({ "error": ["Link expired"] });
        return res.status(402).json({ "error": ["Link is expired"] });
    }
}

//  Function to request a password change
const ReqPasswordChange = async (req, res) => {
    const { email } = req.body;
    const genTVer = createTVerf();
    try {
        const userF = await User.findOne({ email });
        if (!userF) {
            return res.status(402).json({ "error": ["Email id not registered!"] });
        }
        const rPassSent = await TempPass.findOne({ email });
        if (!rPassSent) {
            const newUser = await TempPass.create({
                email,
                tokenForPass: genTVer
            });

            const mailConfigs = {
                from: `Algorithm Vlab KJSIT <${process.env.userE}>`,
                to: email,
                subject: "Password Change Request, [KJSIT Algorithm Vlab]",
                template: "index1",
                context: {
                    name: userF.name, ulink: `${process.env.changePasswordLink}${genTVer}`,
                    frontEndLink: process.env.frontEndLink,
                    contentp1: "We received a request for Password Change from You.",
                    contentp2: "If it was you, then click here to proceed!"
                },
            }
            transporterV.sendMail(mailConfigs, async function (err, result) {
                if (err) {
                    console.log(err);
                    const userDeleted = await TempPass.deleteOne({ email });
                    return res.status(402).json({ "error": ["Error occured, Please try again"] });
                }
                else {
                    return res.status(200).send("Link has been sent to your Email, expires in 30 minutes!");
                }
            });
        }
        else {
            return res.status(402).json({ "error": ["Link has already been sent to your email"] });
        }
    } catch (error) {
        return res.status(402).json({ "error": ["Error occured, Please try again"] });
    }
}

// Function to check if the change password link exists
const cpExists = async (req, res) => {
    const { cpToken } = req.body;
    try {
        const ttExist = await TempPass.findOne({ tokenForPass: cpToken })
        if (ttExist) {
            return res.status(200).send({ "email": ttExist.email });
        }
        else {
            return res.status(402).json({ "error": ["Link is expired!"] });
        }
    } catch (error) {
        return res.status(402).json({ "error": ["Link is expired!"] });
    }

}

// Function to change the password
const changePassword = async (req, res) => {
    const { email, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userUpdated = await User.findOneAndUpdate({ email }, { password: hashedPassword });
        const userDTempPass = await TempPass.deleteOne({ email });
        return res.status(200).send("Password has been reset!");
    } catch (error) {
        return res.status(402).json({ "error": ["Some error occurred please try again!"] });
    }

}

//  Function to login a user
const LoginUser = async (req, res) => {
    //  check if the email and password are provided
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(402).json({ error: ["Please fill all fields"] });
    }
    const userExists = await User.findOne({ email: email, isAdmin: false });
    
    // check if the user exists
    if (userExists) {
        if (await bcrypt.compare(password, userExists.password)) {
            try {
                var token = generateToken(userExists._id);
                res
                    .status(200)
                    .cookie(
                        "ttoken", token,
                        {
                            sameSite: "strict",
                            maxAge: Number(process.env.sessionTimeMS),
                            httpOnly: true,
                            // secure: true
                        }
                    ).send("Login successfull")
            } catch (error) {
                res.status(402).json({ error: ["Error in saving cookies"] });
            }
        }
        else {
            res.status(402).json({ error: ["Wrong credentials"] });
        }
    }
    else {
        res.status(402).json({ error: ["Email id not registered"] });
    }

}

// Function to logout a user
const Logout = async (req, res) => {
    try {
        // res.clearCookie('ttoken');
        res
            .status(200)
            .clearCookie("ttoken")
            .send("Logout successful");
    } catch (error) {
        res.status(402).json({ "error": ["Logout unsuccessful"] });
    }

}

// Function to fetch the user details
const fetchUser = async (req, res) => {
    try {
        // feeds is an array of feedbacks
        const feeds = await Feedback.find({ userId: req.user._id });
        let feedP = [];
        await feeds.map((fe) => {
            feedP.push(fe.algoName);
        });
        var userF = {
            email: req.user.email,
            username: req.user.username,
            name: req.user.name,
            algoPerformed: req.user.algoPerformed,
            institute: req.user.institute,
            department: req.user.department,
            designation: req.user.designation,
            feedP,
            isAdmin: req.user.isAdmin,
            isMAdmin: req.user.isMAdmin
        }
        if (userF) {
            return res.status(200).send(userF);
        }
        else {
            return res.status(402).json({ "error": ["User does not exist"] });
        }
    } catch (error) {
        return res.status(402).json({ "error": ["Some error occurred in fetching user"] });
    }

}

// Function to fill the feedback
const fillFeed = async (req, res) => {

    //  check if the fields are provided
    const { algoName, institute, department, designation, dateP, q1, q2, q3, q4, q5, q6, q7 } = req.body;
    if (!algoName || !q1 || !q2 || !q3 || !q4 || !q5) {
        res.status(402).json({ "error": ["Please fill all fields!"] });
    }
    try {
        const feedPosted = await Feedback.create({
            userId: req.user._id,
            algoName,
            institute,
            department,
            designation,
            dateP,
            q1,
            q2,
            q3,
            q4,
            q5,
            q6,
            q7
        });
        if (feedPosted) {
            res.status(200).send("Feedback Posted!")
        }
        else {
            res.status(402).json({ "error": [""] })
        }
    } catch (error) {

    }

}

// Function to update the algorithms performed by the user
const algoP = async (req, res) => {
    const { algoName } = req.body;
    try {
        const userFA = await User.findById(req.user._id);
        if (userFA.algoPerformed.includes(algoName)) {
            return res.status(402).json({ "error": ["Already performed"] });
        }
        const userF = await User.findOneAndUpdate({ _id: req.user._id },
            { $push: { algoPerformed: algoName } }
        );
        if (userF) {
            res.status(200).send("Successfully updated");
        }
        else {
            res.status(402).json({ "error": ["Some error occurred!"] });
        }
    } catch (error) {
        res.status(402).json({ "error": ["Some error occurred!"] });
    }

}

// Export the functions
module.exports = {
    RegisterUser, LoginUser, fetchUser,
    fillFeed, Logout, finallyRegU, algoP, tverExits,
    ReqPasswordChange, cpExists, changePassword
};

