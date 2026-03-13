const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

/* ---------------- DATABASE CONNECTION ---------------- */

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Admin Panel connected to shared MongoDB'))
.catch(err => console.error('Shared DB Connection Error:', err));

/* ---------------- USER MODEL ---------------- */

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: { type: String },
    isAdmin: { type: Boolean, default: false },
    registrationDate: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

/* ---------------- ADMIN AUTH MIDDLEWARE ---------------- */

const authAdmin = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

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

/* ---------------- API ROUTES ---------------- */

app.post('/api/admin/login', (req, res) => {

    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS) {

        const token = jwt.sign(
            { email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, message: 'Welcome Master Admin' });

    } else {
        res.status(401).json({ message: 'Invalid Admin Credentials' });
    }
});


/* -------- REGISTER WEATHER DASHBOARD USERS -------- */

app.post('/api/user/register', async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email required" });
        }

        let user = await User.findOne({ email });

        if (!user) {

            user = new User({
                email,
                password: "",
                isAdmin: false
            });

            await user.save();
        }

        res.json({ message: "User access recorded" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }

});


/* -------- ADMIN: VIEW USERS -------- */

app.get('/api/admin/users', authAdmin, async (req, res) => {

    try {

        const users = await User.find({}).select('-password');

        res.json(users);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }

});


/* -------- ADMIN: DELETE USER -------- */

app.delete('/api/admin/users/:id', authAdmin, async (req, res) => {

    try {

        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'User eliminated' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }

});


/* ---------------- ADMIN UI PAGE ---------------- */

app.get('/', (req, res) => {

const html = `
<!DOCTYPE html>
<html>
<head>
<title>Admin Dashboard</title>

<style>

body{
font-family:sans-serif;
background:#0f172a;
color:white;
display:flex;
justify-content:center;
align-items:center;
min-height:100vh;
margin:0;
}

.card{
background:#1e293b;
padding:2rem;
border-radius:10px;
width:450px;
}

input{
width:100%;
padding:10px;
margin:10px 0;
background:black;
color:white;
border:1px solid #334155;
border-radius:6px;
}

button{
width:100%;
padding:10px;
background:#3b82f6;
border:none;
color:white;
border-radius:6px;
cursor:pointer;
}

table{
width:100%;
margin-top:20px;
border-collapse:collapse;
}

td,th{
padding:10px;
border-bottom:1px solid #334155;
}

</style>
</head>

<body>

<div class="card">

<div id="login-form">

<h2>Admin Login</h2>

<input id="email" placeholder="Admin Email"/>
<input id="pass" type="password" placeholder="Admin Password"/>

<button onclick="login()">Login</button>

<p id="err"></p>

</div>

<div id="dash" style="display:none">

<h2>Users</h2>

<table>

<thead>
<tr>
<th>Email</th>
<th>Role</th>
<th>Action</th>
</tr>
</thead>

<tbody id="users"></tbody>

</table>

</div>

</div>

<script>

let token=''

async function login(){

const email=document.getElementById('email').value
const pass=document.getElementById('pass').value

const res=await fetch('/api/admin/login',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({email,password:pass})
})

const data=await res.json()

if(res.ok){

token=data.token

document.getElementById('login-form').style.display='none'
document.getElementById('dash').style.display='block'

loadUsers()

}else{
document.getElementById('err').innerText=data.message
}

}

async function loadUsers(){

const res=await fetch('/api/admin/users',{
headers:{'Authorization':'Bearer '+token}
})

const users=await res.json()

const tbody=document.getElementById('users')

tbody.innerHTML=users.map(u=>\`
<tr>
<td>\${u.email}</td>
<td>\${u.isAdmin?'Admin':'User'}</td>
<td>
<button onclick="removeUser('\${u._id}')">Delete</button>
</td>
</tr>
\`).join('')

}

async function removeUser(id){

await fetch('/api/admin/users/'+id,{
method:'DELETE',
headers:{'Authorization':'Bearer '+token}
})

loadUsers()

}

</script>

</body>
</html>
`;

res.send(html);

});


/* ---------------- SERVER START ---------------- */

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log('Admin Server running on port ' + PORT);
});