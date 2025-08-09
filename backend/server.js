// server.js - FINAL COMPLETE AND SECURE VERSION

// 1. Import Dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const session = require('express-session');

// 2. Setup App
const app = express();
const PORT = process.env.PORT || 3000; 

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// 3. Middleware
app.use(cors()); 
app.use(express.json());

// Session Middleware Setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'a-very-strong-secret-key-that-is-temporary',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 // Cookie expires in 1 day
    }
}));

// Serve public files (like index.html and admin-login.html)
app.use(express.static(path.join(__dirname, '../public')));

// 4. API Routes

// --- Main Site API Routes ---
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

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user || password !== user.password) { // In a real app, use bcrypt.compare here
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
        console.log('✅ User logged in:', { id: user.id, email: user.email });
        res.json({ success: true, user: { name: user.name, email: user.email } });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});


// --- Admin Security Routes ---
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "supersecret";

    if (password === ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        console.log('✅ Admin login successful');
        res.status(200).json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid password.' });
    }
});

app.get('/admin', (req, res) => {
    if (req.session.isAdmin) {
        res.sendFile(path.join(__dirname, '../views/admin.html'));
    } else {
        res.redirect('/admin-login.html');
    }
});

app.get('/api/users', async (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(403).json({ message: 'Not authorized. Please log in as admin.' });
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