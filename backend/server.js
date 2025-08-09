// server.js - FINAL VERSION

// 1. Import Dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path'); // <-- FIX #1: Path module is included

// 2. Setup App and Database Connection
const app = express();
// FIX #2: Use Render's port, or 3000 for local development
const PORT = process.env.PORT || 3000; 

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// 3. Middleware
app.use(cors()); 
app.use(express.json());
// FIX #3: Correctly point to the 'public' folder, which is one level up
app.use(express.static(path.join(__dirname, '../public')));

// 4. API Routes (Your existing logic is fine)

// --- SIGNUP ROUTE ---
app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide all fields.' });
    }
    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'Email is already registered.' });
        }
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, password]
        );
        console.log('✅ New user signed up:', newUser.rows[0]);
        res.status(201).json({ success: true, user: newUser.rows[0] });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ success: false, message: 'Server error during signup.' });
    }
});

// --- LOGIN ROUTE ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user || password !== user.password) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
        console.log('✅ User logged in:', { id: user.id, email: user.email });
        res.json({ success: true, user: { name: user.name, email: user.email } });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});

// --- ADMIN ROUTE TO GET ALL USERS ---
app.get('/api/users', async (req, res) => {
    const adminPassword = req.header('X-Admin-Password');
    if (adminPassword !== 'supersecret') {
        return res.status(403).json({ message: 'Not authorized' });
    }
    try {
        const { rows } = await pool.query('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Admin Fetch Error:', error);
        res.status(500).json({ message: 'Failed to fetch users.' });
    }
});

// 5. Start the Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});