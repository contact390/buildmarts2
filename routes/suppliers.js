const express = require("express");
const router = express.Router();
const db = require("../db"); // your DB connection

// ✅ CREATE TABLE (runs once when server starts)
const createTableQuery = `
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    gst_number VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL,
    capacity VARCHAR(100),
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

db.query(createTableQuery, (err) => {
    if (err) {
        console.log("Table creation error:", err);
    } else {
        console.log("Suppliers table ready");
    }
});


// ✅ API TO INSERT DATA
router.post("/supplier", (req, res) => {

    const {
        company,
        gst,
        email,
        contact,
        phone,
        category,
        capacity,
        location
    } = req.body;

    // ✅ INSERT QUERY
    const insertQuery = `
        INSERT INTO suppliers 
        (company_name, gst_number, email, contact_person, phone, category, capacity, location)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        insertQuery,
        [company, gst, email, contact, phone, category, capacity, location],
        (err, result) => {

            if (err) {
                console.log("Insert error:", err);
                return res.status(500).json({
                    message: "Database error"
                });
            }

            res.json({
                message: "Supplier registered successfully"
            });
        }
    );
});

module.exports = router;