const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

exports.register = asyncHandler(async (req, res) => {

    const { name, email, password, role } = req.body;

    // Checking user exists
   const userExists = await User.findOne({ email });
  if (userExists) {
    
    throw new AppError("Email already registered", 409, "DUPLICATE_EMAIL");
  }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "viewer",
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  
});

// Login Logic
exports.login = asyncHandler(async (req, res) => {
 
    const { email, password } = req.body;

    const user = await User.findOne({ email });

  
    // Compare password
    const isMatch = user && (await bcrypt.compare(password, user.password));
    if (!isMatch) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    if (user.status === "inactive") {
    throw new AppError("Account is deactivated", 403, "ACCOUNT_INACTIVE");
  }

  
    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      message: "Login successful",
      token,
      user,
    });
  
});
