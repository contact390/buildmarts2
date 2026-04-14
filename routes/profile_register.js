

const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');

// OTP Storage (email -> {otp, expiresAt, userData})
const otpStorage = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hitaishimatrimony@gmail.com', 
    pass: 'hgkh ylho pibp bopl' 
  }
});

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via email
function sendOTPEmail(email, otp, name) {
  const mailOptions = {
    from: 'hitaishimatrimony@gmail.com',
    to: email,
    subject: 'Your OTP Verification Code - Hitaishi Constructions',
    text: `Hello ${name},\n\nYour OTP verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nDo not share this code with anyone.\n\nThank you,\nHitaishi Constructions Team`
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
}


const createSellerTable = `
  CREATE TABLE IF NOT EXISTS seller_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    company VARCHAR(255),
    address TEXT,
    gst VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

db.query(createSellerTable, (err) => {
  if (err) {
    console.error('Error creating seller_profiles table:', err);
  } else {
    console.log('✅ seller_profiles table created');
  }
});


const createBuyerTable = `
  CREATE TABLE IF NOT EXISTS buyer_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

db.query(createBuyerTable, (err) => {
  if (err) {
    console.error('Error creating buyer_profiles table:', err);
  } else {
    console.log('✅ buyer_profiles table created');
  }
});

// ============ OTP ENDPOINTS ============

// Send OTP for registration
router.post('/send-otp', async (req, res) => {
  const { email, name, userType, phone, address, company, gst, password } = req.body;

  if (!email || !name) {
    return res.status(400).json({ success: false, message: 'Email and name are required' });
  }

  // Check if email already exists
  const checkQuery = `
    SELECT email FROM seller_profiles WHERE email = ?
    UNION
    SELECT email FROM buyer_profiles WHERE email = ?
  `;

  db.query(checkQuery, [email, email], async (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    try {
      const otp = generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Store OTP with user data
      otpStorage.set(email, {
        otp,
        expiresAt,
        userData: { email, name, userType, phone, address, company, gst, password }
      });

      // Send OTP email
      await sendOTPEmail(email, otp, name);

      res.json({ success: true, message: 'OTP sent to your email' });
    } catch (error) {
      console.error('❌ Error sending OTP:', error);
      res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
  });
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp, userType } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  const otpData = otpStorage.get(email);

  if (!otpData) {
    return res.status(400).json({ success: false, message: 'OTP not found or expired' });
  }

  if (Date.now() > otpData.expiresAt) {
    otpStorage.delete(email);
    return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one' });
  }

  if (otpData.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  // OTP is valid, now proceed with registration/password reset based on userType
  res.json({
    success: true,
    message: 'OTP verified successfully',
    userData: otpData.userData
  });
});

// Verify OTP for password reset
router.post('/verify-otp-reset', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  const otpData = otpStorage.get(email);

  if (!otpData) {
    return res.status(400).json({ success: false, message: 'OTP not found or expired' });
  }

  if (Date.now() > otpData.expiresAt) {
    otpStorage.delete(email);
    return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one' });
  }

  if (otpData.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  // OTP is valid, allow password reset
  res.json({ success: true, message: 'OTP verified successfully' });
});

// Send OTP for password reset
router.post('/send-otp-reset', async (req, res) => {
  const { email, name, userType } = req.body;

  if (!email || !name || !userType) {
    return res.status(400).json({ success: false, message: 'Email, name and userType are required' });
  }

  // Check if user exists
  const table = userType === 'buyer' ? 'buyer_profiles' : 'seller_profiles';
  const checkQuery = `SELECT id FROM ${table} WHERE email = ?`;

  db.query(checkQuery, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    try {
      const otp = generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      otpStorage.set(email, {
        otp,
        expiresAt,
        userData: { email, userType }
      });

      await sendOTPEmail(email, otp, name);

      res.json({ success: true, message: 'OTP sent to your email' });
    } catch (error) {
      console.error('❌ Error sending OTP:', error);
      res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
  });
});


router.post('/seller-profile', (req, res) => {
  const { name, email, phone, company, address, gst, password, otpVerified } = req.body;

  // Validation
  if (!name || !email || !password || !address) {
    console.log('❌ Validation failed - Missing required fields');
    return res.status(400).json({ error: 'Please fill in all required fields (Name, Email, Password, Address)' });
  }

  // Check if OTP was verified
  if (!otpVerified) {
    return res.status(400).json({ error: 'Email verification required' });
  }

  console.log('📝 Seller registration attempt for:', email);

  const checkQuery = `
    SELECT email FROM seller_profiles WHERE email = ?
    UNION
    SELECT email FROM buyer_profiles WHERE email = ?
  `;

  db.query(checkQuery, [email, email], (err, results) => {
    if (err) {
      console.error('❌ Check query error:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    if (results.length > 0) {
      console.log('⚠️ Email already registered:', email);
      return res.status(400).json({ error: 'Email already registered as buyer or seller' });
    }

    const insertQuery = `
      INSERT INTO seller_profiles (name, email, phone, company, address, gst, password)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertQuery, [name, email, phone || '', company || '', address, gst || '', password], (err, result) => {
      if (err) {
        console.error('❌ Insert query error:', err);
        return res.status(500).json({ error: 'Error inserting seller profile: ' + err.message });
      }

      console.log('✅ Seller registered successfully:', email, 'ID:', result.insertId);

      // Clear OTP after successful registration
      otpStorage.delete(email);

      // automatically log the user in by storing session
      const newUser = { id: result.insertId, name, email };
      req.session.user = { ...newUser, userType: 'seller' };
      req.session.save(err => {
        if (err) console.error('❌ Session save error after registration:', err);
      });

      // Send email
      const mailOptions = {
        from: 'hitaishimatrimony@gmail.com',
        to: email,
        subject: 'Welcome to Hitaishi Seller Platform',
        text: `Hello ${name},\n\nYour seller registration is successful!\n\nThank you for joining Hitaishi Constructions!\n\nYou can now login with your email and password.`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('❌ Email failed:', error);
        } else {
          console.log('📧 Email sent:', info.response);
        }
      });

      res.status(200).json({
        success: true,
        message: 'Seller profile submitted successfully',
        user: { id: result.insertId, name, email, userType: 'seller' }
      });
    });
  });
});


router.post('/buyer-profile', (req, res) => {
  const { name, email, phone, address, password, otpVerified } = req.body;

  // Validation
  if (!name || !email || !password || !address) {
    console.log('❌ Validation failed - Missing required fields');
    return res.status(400).json({ error: 'Please fill in all required fields (Name, Email, Password, Address)' });
  }

  // Check if OTP was verified
  if (!otpVerified) {
    return res.status(400).json({ error: 'Email verification required' });
  }

  console.log('📝 Buyer registration attempt for:', email);

  const checkQuery = `
    SELECT email FROM seller_profiles WHERE email = ?
    UNION
    SELECT email FROM buyer_profiles WHERE email = ?
  `;

  db.query(checkQuery, [email, email], (err, results) => {
    if (err) {
      console.error('❌ Check query error:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    if (results.length > 0) {
      console.log('⚠️ Email already registered:', email);
      return res.status(400).json({ error: 'Email already registered as buyer or seller' });
    }

    const insertQuery = `
      INSERT INTO buyer_profiles (name, email, phone, address, password)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(insertQuery, [name, email, phone || '', address, password], (err, result) => {
      if (err) {
        console.error('❌ Insert query error:', err);
        return res.status(500).json({ error: 'Error inserting buyer profile: ' + err.message });
      }

      console.log('✅ Buyer registered successfully:', email, 'ID:', result.insertId);

      // Clear OTP after successful registration
      otpStorage.delete(email);

      // Send email
      const mailOptions = {
        from: 'hitaishimatrimony@gmail.com',
        to: email,
        subject: 'Welcome to Hitaishi Buyer Platform',
        text: `Hello ${name},\n\nYour buyer registration is successful!\n\nThank you for joining Hitaishi Constructions!\n\nYou can now login with your email and password and start shopping.`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('❌ Email failed:', error);
        } else {
          console.log('📧 Email sent:', info.response);
        }
      });

      res.status(200).json({ message: 'Buyer profile submitted successfully' });
    });
  });
});


router.post('/login', (req, res) => {
  const { identifier, password, userType } = req.body;

  if (!['buyer', 'seller'].includes(userType)) {
    return res.status(400).json({ success: false, message: "Invalid user type" });
  }

  const table = userType === 'buyer' ? 'buyer_profiles' : 'seller_profiles';

  const query = `
    SELECT * FROM ${table}
    WHERE (email = ? OR phone = ?) AND password = ?
  `;

  db.query(query, [identifier, identifier, password], (err, results) => {
    if (err) {
      console.error("Login DB error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length > 0) {
      // Set session user (do not store password)
      const userRow = results[0];
      const user = { id: userRow.id, name: userRow.name, email: userRow.email };
      req.session.user = { ...user, userType };
      
      // Explicitly save the session
      req.session.save((err) => {
        if (err) {
          console.error("❌ Session save error:", err);
          return res.status(500).json({ success: false, message: "Session save failed" });
        }
        console.log("✅ Session saved for user:", user.name);
        return res.json({ success: true, message: "Login successful", user });
      });
    } else {
      return res.json({ success: false, message: "Invalid credentials" });
    }
  });
});

// Return current session user
router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ success: true, user: req.session.user });
  }
  return res.json({ success: false, user: null });
});

// Logout - destroy session
router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ success: false, message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      return res.json({ success: true, message: 'Logged out' });
    });
  } else {
    return res.json({ success: true, message: 'No active session' });
  }
});


router.get('/buyer-profile', (req, res) => {
  const query = 'SELECT * FROM buyer_profiles ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching buyers:', err);
      return res.status(500).json({ success: false, message: 'Error fetching buyers' });
    }
    res.json({ success: true, buyers: results });
  });
});



// fetch all sellers (admin endpoint)
router.get('/seller-profile', (req, res) => {
  const query = 'SELECT * FROM seller_profiles ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching sellers:', err);
      return res.status(500).json({ success: false, message: 'Error fetching sellers' });
    }
    res.json({ success: true, sellers: results });
  });
});

// fetch currently logged-in seller using session
router.get('/seller-profile/me', (req, res) => {
  if (!req.session || !req.session.user || req.session.user.userType !== 'seller') {
    return res.status(401).json({ success: false, message: 'Not logged in' });
  }
  const sellerId = req.session.user.id;
  const query = 'SELECT id, name, email, phone, company, address, gst FROM seller_profiles WHERE id = ?';
  db.query(query, [sellerId], (err, results) => {
    if (err) {
      console.error('Error fetching seller profile:', err);
      return res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }
    res.json({ success: true, user: results[0] });
  });
});

// update current seller's profile
router.put('/seller-profile', (req, res) => {
  if (!req.session || !req.session.user || req.session.user.userType !== 'seller') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const sellerId = req.session.user.id;
  const { name, email, phone, company, address, gst } = req.body;
  if (!name || !email || !address) {
    return res.status(400).json({ success: false, message: 'Name, email and address are required' });
  }

  const updateQuery = `
    UPDATE seller_profiles
    SET name = ?, email = ?, phone = ?, company = ?, address = ?, gst = ?
    WHERE id = ?
  `;
  db.query(updateQuery, [name, email, phone || '', company || '', address, gst || '', sellerId], (err) => {
    if (err) {
      console.error('❌ Seller profile update error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    req.session.user = { ...req.session.user, name, email };
    req.session.save(() => {});
    res.json({ success: true, message: 'Profile updated', user: { id: sellerId, name, email, userType: 'seller' } });
  });
});



// Forgot Password - Reset Password
router.post('/reset-password', (req, res) => {
  const { email, newPassword, confirmPassword, userType, otpVerified } = req.body;

  if (!email || !newPassword || !confirmPassword || !userType) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  if (!otpVerified) {
    return res.status(400).json({ success: false, message: 'Email verification required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  if (!['buyer', 'seller'].includes(userType)) {
    return res.status(400).json({ success: false, message: 'Invalid user type' });
  }

  const table = userType === 'buyer' ? 'buyer_profiles' : 'seller_profiles';

  // Check if user exists
  const checkQuery = `SELECT id FROM ${table} WHERE email = ?`;
  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update password
    const updateQuery = `UPDATE ${table} SET password = ? WHERE email = ?`;
    db.query(updateQuery, [newPassword, email], (err) => {
      if (err) {
        console.error('Error updating password:', err);
        return res.status(500).json({ success: false, message: 'Failed to update password' });
      }

      // Clear OTP after successful password reset
      otpStorage.delete(email);

      res.json({ success: true, message: 'Password reset successful' });
    });
  });
});


router.put('/approve-seller/:id', (req, res) => {
  const id = req.params.id;

  db.query('UPDATE seller_profiles SET status="approved" WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json({ success:false });
    res.json({ success:true });
  });
});


router.put('/block-user/:type/:id', (req, res) => {
  const { type, id } = req.params;

  const table = type === 'seller' ? 'seller_profiles' : 'buyer_profiles';

  db.query(`UPDATE ${table} SET status="blocked" WHERE id=?`, [id], (err) => {
    if (err) return res.status(500).json({ success:false });
    res.json({ success:true });
  });
});


module.exports = router;


