const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

console.log("✅ Auth Routes File Loaded!");

const JWT_SECRET = process.env.JWT_SECRET || "travia_secret_key1836821";

// Register Logic
router.post('/register', async (req, res) => {
    try{
        const {username, email, password} = req.body;

        // Validation
        if(!username || !email || !password) {
            return res.status(400).json({message: "Please fill out all the Fields!"});
        }

        // Check for Existing User!
        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(400).json({message: "User Already Exists!"});

        // Encryption
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Creation of New User
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();

        res.status(201).json({ 
            message: "Account Created Successfully!", 
            memberId: savedUser.memberId
        });
         
    }
    catch(error) {
            console.error("Registration Error!", error);
            res.status(500).json({ message: "Server Error", error: error.message});
         }
});

// Login Logic
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({
            token, 
            user: { 
                id: user._id,
                memberId: user.memberId,
                username: user.username, 
                email: user.email,
                avatar: user.avatar,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

module.exports = router;