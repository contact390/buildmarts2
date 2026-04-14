// db.js
<<<<<<< HEAD
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '2001', // ← replace with your DB password
  database: 'buildingmaterials',
  port:3306 // ← make sure this DB exists
});

=======
require('dotenv').config(); // Load environment variables

const mysql = require('mysql2');

// Create connection using ENV variables
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'buildmart_user',
  password: process.env.DB_PASSWORD || 'Param@520pwd',
  database: process.env.DB_NAME || 'building_materials',
  port: process.env.DB_PORT || 3306
});

// Connect to MySQL
>>>>>>> 446e9cc322e6defa7982f6adf5707b991ba2416f
db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
  } else {
<<<<<<< HEAD
    console.log('✅ MySQL connected.');
  }
});

module.exports = db;
=======
    console.log('✅ MySQL connected successfully.');
    console.log('👉 Connected as:', process.env.DB_USER);
  }
});

module.exports = db;
>>>>>>> 446e9cc322e6defa7982f6adf5707b991ba2416f
