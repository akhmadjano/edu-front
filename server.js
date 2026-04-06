const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || 'https://edu-bg-production.up.railway.app';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'course-platform-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// API URL ni frontendga uzatish
app.locals.API_URL = API_URL;

// Sahifalar
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/course', (req, res) => res.sendFile(path.join(__dirname, 'public', 'course.html')));
app.get('/lesson/:id', (req, res) => res.sendFile(path.join(__dirname, 'public', 'lesson.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'public', 'profile.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/test', (req, res) => res.sendFile(path.join(__dirname, 'public', 'test.html')));
// API URL endpoint (frontend JS uchun)
app.get('/config', (req, res) => {
  res.json({ apiUrl: API_URL });
});

app.listen(PORT, () => {
  console.log(`✅ Frontend server ishlamoqda: http://localhost:${PORT}`);
  console.log(`🔗 Backend API: ${API_URL}`);
});
