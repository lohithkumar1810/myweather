const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Admin Panel connected to shared MongoDB'))
    .catch(err => console.error('Shared DB Connection Error:', err));

// User Model
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: { type: String },
    isAdmin: { type: Boolean, default: false },
    registrationDate: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Admin Authentication Middleware
const authAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.email === process.env.ADMIN_EMAIL) {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden' });
        }
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// --- API ROUTES ---

app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS) {
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, message: 'Welcome Master Admin' });
    } else {
        res.status(401).json({ message: 'Invalid Admin Credentials' });
    }
});

app.get('/api/admin/users', authAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/admin/users/:id', authAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User eliminated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- UI SERVING ---

app.get('/', (req, res) => {
    const html = \
    <!DOCTYPE html>
    <html>
    <head>
        <title>Admin Dashboard</title>
        <style>
            body { font-family: sans-serif; background: #0f172a; color: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
            .card { background: #1e293b; padding: 2.5rem; border-radius: 12px; width: 450px; border: 1px solid #334155; }
            input { width: 100%; padding: 12px; margin: 10px 0; border-radius: 6px; border: 1px solid #334155; background: #000; color: white; box-sizing: border-box; }
            button { width: 100%; padding: 12px; background: #3b82f6; color: white; border: none; cursor: pointer; border-radius: 6px; font-weight: bold; }
            #dashboard { display: none; width: 700px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #334155; }
            .logout { float: right; cursor: pointer; color: #94a3b8; font-size: 0.8rem; }
            .error { color: #ef4444; font-size: 0.8rem; margin-top: 5px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="card" id="main-container">
            <div id="login-form">
                <h2 style="text-align:center">Admin Portal</h2>
                <p style="text-align:center; color:#94a3b8; font-size:0.9rem">Please sign in with Admin Email</p>
                <input type="email" id="email" placeholder="Admin Email">
                <input type="password" id="pass" placeholder="Admin Password">
                <button onclick="doLogin()">Login as Admin</button>
                <div id="error" class="error"></div>
            </div>
            <div id="dashboard">
                <span class="logout" onclick="location.reload()">System Logout</span>
                <h2>Database Status: <span style="color:#22c55e">Connected</span></h2>
                <p style="color:#94a3b8">List of users who accessed the website:</p>
                <table id="ut">
                    <thead><tr><th>User Email</th><th>Status/Role</th><th>Manage</th></tr></thead>
                    <tbody id="ub"></tbody>
                </table>
            </div>
        </div>
        <script>
            let t = '';
            async function doLogin() {
                const e = document.getElementById('email').value;
                const p = document.getElementById('pass').value;
                const err = document.getElementById('error');
                err.innerText = '';
                
                const res = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({email: e, password: p})
                });
                const d = await res.json();
                if(res.ok) {
                    t = d.token;
                    document.getElementById('login-form').style.display='none';
                    document.getElementById('dashboard').style.display='block';
                    document.getElementById('main-container').style.width='800px';
                    load();
                } else {
                    err.innerText = d.message;
                }
            }
            async function load() {
                const res = await fetch('/api/admin/users', { headers: {'Authorization': 'Bearer ' + t}});
                const users = await res.json();
                const ub = document.getElementById('ub');
                ub.innerHTML = users.map(user => "<tr><td>" + user.email + "</td><td>" + (user.isAdmin ? '<span style=\"color:#3b82f6\">Admin</span>' : 'Registered User') + "</td><td><button style=\"background:#ef4444; width:auto; padding:5px 10px\" onclick=\"del(\'" + user._id + "\')\">Remove Account</button></td></tr>").join('');
            }
            async function del(id) {
                if(!confirm('Permanently remove this user?')) return;
                await fetch('/api/admin/users/' + id, { method: 'DELETE', headers: {'Authorization': 'Bearer ' + t}});
                load();
            }
        </script>
    </body>
    </html>
    \;
    res.send(html);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log('Admin Server on ' + PORT));
