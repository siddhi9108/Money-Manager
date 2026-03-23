const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Signup route
router.post('/signup', async (req, res) => {
  console.log('📝 Signup request received:', { email: req.body.email, name: req.body.name });
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    console.log('❌ Missing fields');
    return res.status(400).json({ error: 'All fields required' });
  }

  if (password.length < 6) {
    console.log('❌ Password too short');
    return res.status(400).json({ error: 'Password must be 6+ characters' });
  }

  try {
    console.log('🔍 Checking if email exists...');
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({ error: 'Email already exists' });
    }

    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('💾 Creating user in database...');
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    console.log('✅ User created successfully with ID:', user._id);
    res.status(201).json({ message: 'User created successfully', userId: user._id });
  } catch (error) {
    console.error('❌ Signup error:', error.message);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  console.log('🔐 Login request received:', { email: req.body.email });
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    console.log('❌ Missing email or password');
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    console.log('🔍 Looking up user...');
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('👤 User found:', user._id);

    console.log('🔐 Comparing password...');
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('🎫 Generating JWT token...');
    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET || 'fallback-secret-key', 
      { expiresIn: '30d' }
    );
    
    console.log('✅ Login successful for user:', email);
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      } 
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ error: 'Authentication failed: ' + error.message });
  }
});

module.exports = router;