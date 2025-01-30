const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Incorrect password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, msg: "Login successful" }); // Send token to client
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Logout is now handled client-side (just delete token from storage)
const logoutUser = (req, res) => {
  return res.json({ msg: "Successfully logged out. Remove token on the client side." });
};

module.exports = { loginUser, logoutUser };
