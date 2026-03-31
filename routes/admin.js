const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to check if user is admin
const checkAdmin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  
  // Query to check if user has admin role
  db.query('SELECT userType FROM users WHERE id = ?', [req.session.userId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    
    if (results.length === 0 || results[0].userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    next();
  });
};

// ============== ADMIN LOGIN ==============
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }
  
  const query = 'SELECT id, userType, name, email FROM users WHERE email = ? AND userType = "admin"';
  
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
    
    const user = results[0];
    
    // Query to get the stored password and verify
    const passwordQuery = 'SELECT password FROM users WHERE id = ? AND userType = "admin"';
    
    db.query(passwordQuery, [user.id], (err, pwResults) => {
      if (err || pwResults.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      const storedPassword = pwResults[0].password;
      
      // Compare passwords (plain text for now)
      if (password !== storedPassword) {
        return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
      }
      
      // Password match - set session
      req.session.userId = user.id;
      req.session.userType = 'admin';
      req.session.userName = user.name;
      
      res.json({
        success: true,
        message: 'Admin login successful',
        user: { id: user.id, name: user.name, email: user.email, userType: 'admin' }
      });
    });
  });
});

// ============== ADMIN REGISTRATION ==============
router.post('/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }
  
  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  
  // Check if email already exists
  const checkQuery = 'SELECT id FROM users WHERE email = ?';
  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    
    if (results.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    // Insert new admin user
    const insertQuery = 'INSERT INTO users (name, email, password, phone, userType, createdAt) VALUES (?, ?, ?, ?, ?, NOW())';
    
    db.query(insertQuery, [name, email, password, phone || null, 'admin'], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Failed to register admin' });
      }
      
      res.json({
        success: true,
        message: 'Admin registered successfully',
        user: {
          id: result.insertId,
          name,
          email,
          userType: 'admin'
        }
      });
    });
  });
});

// ============== GET ADMIN DASHBOARD DATA ==============
router.get('/dashboard', checkAdmin, (req, res) => {
  const dashboardData = {};
  
  // Get total users count
  db.query('SELECT COUNT(*) as total FROM users', (err, userCount) => {
    if (!err) dashboardData.totalUsers = userCount[0].total;
    
    // Get total products count
    db.query('SELECT COUNT(*) as total FROM products', (err, productCount) => {
      if (!err) dashboardData.totalProducts = productCount[0].total;
      
      // Get total orders count
      db.query('SELECT COUNT(*) as total FROM orders', (err, orderCount) => {
        if (!err) dashboardData.totalOrders = orderCount[0].total;
        
        // Get total revenue
        db.query('SELECT COALESCE(SUM(total_amount), 0) as totalRevenue FROM orders WHERE status = "completed"', (err, revenue) => {
          if (!err) dashboardData.totalRevenue = revenue[0].totalRevenue;
          
          // Get recent orders
          db.query('SELECT * FROM orders ORDER BY createdAt DESC LIMIT 5', (err, recentOrders) => {
            if (!err) dashboardData.recentOrders = recentOrders;
            
            res.json({ success: true, data: dashboardData });
          });
        });
      });
    });
  });
});

// ============== MANAGE USERS ==============
// Get all users
router.get('/users', checkAdmin, (req, res) => {
  const query = 'SELECT id, name, email, userType, phone, createdAt FROM users WHERE userType = "buyer" ORDER BY createdAt DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
    
    res.json({ success: true, users: results });
  });
});

// Get single user details
router.get('/users/:id', checkAdmin, (req, res) => {
  const query = 'SELECT * FROM users WHERE id = ?';
  
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user: results[0] });
  });
});

// Delete user
router.delete('/users/:id', checkAdmin, (req, res) => {
  // Prevent deleting self
  if (req.params.id == req.session.userId) {
    return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
  }
  
  const query = 'DELETE FROM users WHERE id = ?';
  
  db.query(query, [req.params.id], (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
    
    res.json({ success: true, message: 'User deleted successfully' });
  });
});

// Update user role
router.put('/users/:id/role', checkAdmin, (req, res) => {
  const { userType } = req.body;
  const allowedRoles = ['buyer', 'seller', 'admin'];
  
  if (!userType || !allowedRoles.includes(userType)) {
    return res.status(400).json({ success: false, message: 'Invalid user role' });
  }
  
  const query = 'UPDATE users SET userType = ? WHERE id = ?';
  
  db.query(query, [userType, req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to update user role' });
    }
    
    res.json({ success: true, message: 'User role updated successfully' });
  });
});

// ============== MANAGE PRODUCTS ==============
// Get all products
router.get('/products', checkAdmin, (req, res) => {
  const query = 'SELECT id, name, category, price, stock, uploaded_by, createdAt FROM products ORDER BY createdAt DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
    
    res.json({ success: true, products: results });
  });
});

// Delete product
router.delete('/products/:id', checkAdmin, (req, res) => {
  const query = 'DELETE FROM products WHERE id = ?';
  
  db.query(query, [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
    
    res.json({ success: true, message: 'Product deleted successfully' });
  });
});

// Update product
router.put('/products/:id', checkAdmin, (req, res) => {
  const { name, price, stock, category } = req.body;
  const query = 'UPDATE products SET name = ?, price = ?, stock = ?, category = ? WHERE id = ?';
  
  db.query(query, [name, price, stock, category, req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to update product' });
    }
    
    res.json({ success: true, message: 'Product updated successfully' });
  });
});

// ============== MANAGE ORDERS ==============
// Get all orders
router.get('/orders', checkAdmin, (req, res) => {
  const query = 'SELECT id, user_id, total_amount, status, createdAt FROM orders ORDER BY createdAt DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
    
    res.json({ success: true, orders: results });
  });
});

// Get order details
router.get('/orders/:id', checkAdmin, (req, res) => {
  const query = 'SELECT * FROM orders WHERE id = ?';
  
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch order' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ success: true, order: results[0] });
  });
});

// Update order status
router.put('/orders/:id/status', checkAdmin, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
  
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid order status' });
  }
  
  const query = 'UPDATE orders SET status = ? WHERE id = ?';
  
  db.query(query, [status, req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
    
    res.json({ success: true, message: 'Order status updated successfully' });
  });
});

// ============== ANALYTICS ==============
// Get sales analytics
router.get('/analytics/sales', checkAdmin, (req, res) => {
  const analyticsData = {};
  
  // Monthly sales
  db.query(`
    SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as count, SUM(total_amount) as total
    FROM orders
    WHERE status = 'completed'
    GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
    ORDER BY month DESC
    LIMIT 12
  `, (err, monthlySales) => {
    if (!err) analyticsData.monthlySales = monthlySales;
    
    // Sales by category
    db.query(`
      SELECT p.category, COUNT(oi.id) as productCount, SUM(oi.quantity) as totalQuantity
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY p.category
      ORDER BY totalQuantity DESC
    `, (err, byCat) => {
      if (!err) analyticsData.salesByCategory = byCat;
      
      // Top products
      db.query(`
        SELECT p.name, p.id, SUM(oi.quantity) as totalSold, SUM(oi.price * oi.quantity) as revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        GROUP BY p.id
        ORDER BY totalSold DESC
        LIMIT 10
      `, (err, topProducts) => {
        if (!err) analyticsData.topProducts = topProducts;
        
        // Customer analytics
        db.query(`
          SELECT COUNT(DISTINCT user_id) as totalCustomers,
                 AVG(total_amount) as avgOrderValue,
                 MAX(total_amount) as maxOrderValue
          FROM orders
          WHERE status = 'completed'
        `, (err, custAnalytics) => {
          if (!err) analyticsData.customerAnalytics = custAnalytics[0];
          
          res.json({ success: true, analytics: analyticsData });
        });
      });
    });
  });
});

// Get user statistics
router.get('/analytics/users', checkAdmin, (req, res) => {
  const query = `
    SELECT 
      userType,
      COUNT(*) as count
    FROM users
    GROUP BY userType
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
    
    res.json({ success: true, userStats: results });
  });
});

// ============== GET CURRENT USER ==============
router.get('/me', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  
  db.query('SELECT id, name, email, userType FROM users WHERE id = ?', [req.session.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user: results[0] });
  });
});

// ============== LOGOUT ==============
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to logout' });
    }
    
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

module.exports = router;
