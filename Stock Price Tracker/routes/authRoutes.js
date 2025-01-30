const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');

// Signup
router.post('/signup', 
    [
      body('email').isEmail().normalizeEmail(),
      body('password').isLength({ min: 6 })
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const { email, password } = req.body;
        
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
          return res.status(400).json({ msg: 'User already exists' });
        }
  
        // Create a new user
        user = new User({ email, password });
        await user.save();
  
        // Return a success message instead of a token
        res.json({ msg: 'Account successfully created. Now login to your account.' });
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
    }
  );
  
// Login
router.post('/login',
    [
      body('email').isEmail().normalizeEmail(),
      body('password').exists()
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const { email, password } = req.body;
  
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(400).json({ msg: 'Invalid credentials' });
        }
  
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return res.status(400).json({ msg: 'Invalid credentials' });
        }
  
        // Create JWT with 1-hour expiration
        const payload = { userId: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: '1h'  // Expiry set to 1 hour
        });
  
        res.json({ token });
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
    }
  );


  

  const { logoutUser } = require("../controllers/userController");
  // Logout Route
  router.post("/logout", logoutUser);
  
  module.exports = router;