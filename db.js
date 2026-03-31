// db.js
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
db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
  } else {
    console.log('✅ MySQL connected successfully.');
    console.log('👉 Connected as:', process.env.DB_USER);
  }
});

module.exports = db;