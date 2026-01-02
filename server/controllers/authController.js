const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// --- Helper: Generate Token ---
const generateToken = (id, isAdmin) => {
  // FIX: Force a fallback secret if .env fails
  const secret = process.env.JWT_SECRET;

  return jwt.sign({ id, isAdmin }, secret, {
    expiresIn: "1d",
  });
};

// --- Logic: Register User ---
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill out all fields." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: "Account created successfully!",
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        memberId: savedUser.memberId,
      },
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// --- Logic: Login User ---
const loginUser = async (req, res) => {
  // Login Logs for Security
  console.log(
    `[AUTH CHECK] Login attempt for email: ${
      req.body.email
    } at ${new Date().toISOString()}`
  );

  try {
    const { email, password } = req.body;

    // 1. Check User
    const user = await User.findOne({ email });
    if (!user) {
      // Log Message if User is not Found
      console.log(
        `[AUTH CHECK] User is not found in the Db for email ${email}`
      );
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 2. Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[AUTH FAIL] Password Mismatch for ${email}`);
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 4. LOG: Success
    console.log(
      `[AUTH SUCCESS] Token generated for user: ${user.username} (${user._id})`
    );

    // 3. Generate Token
    const token = generateToken(user._id, user.isAdmin);

    // 4. Respond
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        memberId: user.memberId,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

module.exports = { registerUser, loginUser };
