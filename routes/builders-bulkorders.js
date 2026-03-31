const express = require("express");
const multer = require("multer");
const mysql = require("mysql2");
const fs = require("fs");
const db = require('../db');

const router = express.Router();

// ===============================
// ✅ MYSQL CONNECTION
// ===============================

// ===============================
// 📌 TABLE NAME
// ===============================
const TABLE_NAME = "`Bulders-bulk-orders`";

// ===============================
// 📁 FILE UPLOAD
// ===============================
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) =>
        cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// ===============================
// 🚀 INSERT ORDER (REAL MYSQL)
// ===============================
router.post("/bulk-order", upload.single("file"), (req, res) => {

    const {
        builderName,
        mobile,
        location,
        projectType,
        materials,
        quantity,
        date
    } = req.body;

    const boqFile = req.file ? req.file.filename : null;

    const query = `
    INSERT INTO ${TABLE_NAME}
    (builderName, mobile, location, projectType, materials, quantity, boqFile, date, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    console.log("\n📌 Executing Query:", query);

    db.query(
        query,
        [builderName, mobile, location, projectType, materials, quantity, boqFile, date],
        (err, result) => {
            if (err) {
                console.error("❌ Insert Error:", err.message);
                return res.status(500).json({ message: "Insert Failed" });
            }

            console.log("✅ Inserted ID:", result.insertId);

            res.json({
                message: "✅ Stored in MySQL",
                id: result.insertId
            });
        }
    );
});

// ===============================
// 📡 GET ALL
// ===============================
router.get("/orders", (req, res) => {

    const query = `SELECT * FROM ${TABLE_NAME}`;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Fetch Error:", err.message);
            return res.status(500).json({ message: "Fetch Failed" });
        }

        console.log("✅ Records:", results.length);
        res.json(results);
    });
});

// ===============================
// ❌ DELETE
// ===============================
router.delete("/order/:id", (req, res) => {

    const query = `DELETE FROM ${TABLE_NAME} WHERE id = ?`;

    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error("❌ Delete Error:", err.message);
            return res.status(500).json({ message: "Delete Failed" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Not Found" });
        }

        console.log("✅ Deleted ID:", req.params.id);
        res.json({ message: "Deleted Successfully" });
    });
});

// ===============================
module.exports = router;