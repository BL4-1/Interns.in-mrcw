// server.js - FINAL VERSION WITH CORRECT MIDDLEWARE ORDER

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

// 3. Middleware (CORRECT ORDER)

// ▼▼▼ FIX #1: SESSION a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a- MIDDLEWAREWAREHOUSE_AI comes FIRST ---
// The session middleware must be used before the CORS middleware
// so that the session is established before CORS checks the request.
app.set('trust proxy', 1); // Trust the first proxy (important for Render)
app.use(session({
    secret: process.env.SESSION_SECRET || 'a-very-strong-secret-key-that-is-temporary',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: true, // Requires HTTPS, which Render has
        httpOnly: true, // Prevents client-side JS from reading the cookie
        sameSite: 'none', // Allows cross-domain cookie
        maxAge: 1000 * 60 * 60 * 24 // Cookie expires in 1 day
    }
}));

// ▼▼▼ FIX #2: CORS comes SECOND ---
const corsOptions = {
    origin: 'https://interns-in-mrcw.netlify.app',
    credentials: true,
};
app.use(cors(corsOptions)); 

app.use(express.json());

// Serve public files (like index.html and admin-login.html)
app.use(express.static(path.join(__dirname, '../public')));


// 4. API Routes (The rest of your code is perfect)
// --- Main Site API Routes ---
app.post('/api/signup', async (req, res) => { /* ...your existing signup code... */ });
app.post('/api/login', async (req, res) => { /* ...your existing login code... */ });
// --- Admin Security Routes ---
app.post('/api/admin/login', (req, res) => { /* ...your existing admin login code... */ });
app.get('/admin', (req, res) => { /* ...your existing /admin route code... */ });
app.get('/api/users', async (req, res) => { /* ...your existing /api/users code... */ });


// 5. Start the Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});