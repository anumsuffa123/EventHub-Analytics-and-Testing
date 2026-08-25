const express = require('express');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set before starting the server.');
}

const allowedOrigins = new Set([FRONTEND_URL, 'http://localhost:5173']);

// Ensure uploads folder exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS.'));
  },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Local DB JSON files helper paths
const USERS_FILE = path.join(process.cwd(), 'users.json');
const REGISTRATIONS_FILE = path.join(process.cwd(), 'registrations.json');

const readUsers = () => {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch (error) {
    return [];
  }
};

const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

const readRegistrations = () => {
  try {
    if (!fs.existsSync(REGISTRATIONS_FILE)) {
      fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(REGISTRATIONS_FILE, 'utf8'));
  } catch (error) {
    return [];
  }
};

const writeRegistrations = (registrations) => {
  fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(registrations, null, 2));
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Backend file-type guard — rejects non-image uploads before they reach disk
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only JPG, JPEG and PNG images are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter
});

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. Token is missing.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

// Auth API endpoints
app.post('/api/auth/signup', (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;
  const errors = {};

  if (!fullName || fullName.trim().length < 3) {
    errors.fullName = 'Full Name is required and must be at least 3 characters.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  } else {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number.';
    }
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const users = readUsers();
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({
      success: false,
      errors: { email: 'Email address is already registered.' }
    });
  }

  const saltRounds = 10;
  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  const newUser = {
    id: Date.now().toString(),
    fullName,
    email: email.toLowerCase(),
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeUsers(users);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, fullName: newUser.fullName },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(201).json({
    success: true,
    message: 'User registered successfully.',
    token,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const errors = {};

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const users = readUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.'
    });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, fullName: user.fullName },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email
    }
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      fullName: req.user.fullName,
      email: req.user.email
    }
  });
});

// Registrations API endpoints
app.get('/api/registrations', authenticateToken, (req, res) => {
  const registrations = readRegistrations();
  const userRegistrations = registrations.filter(
    r => r.userEmail && r.userEmail.toLowerCase() === req.user.email.toLowerCase()
  );
  res.status(200).json({
    success: true,
    data: userRegistrations
  });
});

app.post('/api/registrations', authenticateToken, upload.single('profileImage'), (req, res) => {
  const errors = {};
  const { fullName, email, phone, studentId, department, eventType, eventDate } = req.body;

  if (!fullName || fullName.trim().length < 3) {
    errors.fullName = 'Full Name is required and must be at least 3 characters.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  const phoneRegex = /^03\d{9}$/;
  if (!phone || !phoneRegex.test(phone)) {
    errors.phone = 'Phone number must be exactly 11 digits in Pakistani format (e.g. 03001234567).';
  }

  if (!studentId || studentId.trim() === '') {
    errors.studentId = 'Student ID is required.';
  }

  if (!department || department === '') {
    errors.department = 'Department is required.';
  }

  if (!eventType || eventType === '') {
    errors.eventType = 'Event Type is required.';
  }

  if (!eventDate || eventDate === '') {
    errors.eventDate = 'Event Date is required.';
  } else {
    const inputDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (inputDate < today) {
      errors.eventDate = 'Event Date cannot be in the past.';
    }
  }

  if (!req.file) {
    errors.profileImage = 'Profile Picture/Student Card image is required.';
  } else {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];

    if (!allowedMimeTypes.includes(req.file.mimetype) || !allowedExtensions.includes(fileExt)) {
      errors.profileImage = 'Image must be in JPG, JPEG, or PNG format.';
      fs.unlinkSync(req.file.path);
    }
  }

  if (Object.keys(errors).length > 0) {
    if (req.file && !errors.profileImage) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({
      success: false,
      errors
    });
  }

  const registrations = readRegistrations();
  const newRegistration = {
    id: Date.now().toString(),
    userEmail: req.user.email,
    fullName,
    email,
    phone,
    studentId,
    department,
    eventType,
    eventDate,
    imageUrl: `/uploads/${req.file.filename}`,
    createdAt: new Date().toISOString()
  };

  registrations.push(newRegistration);
  writeRegistrations(registrations);

  res.status(200).json({
    success: true,
    message: 'Registration submitted successfully.',
    data: newRegistration
  });
});

// PUT /api/registrations/:id — update an existing registration
app.put('/api/registrations/:id', authenticateToken, upload.single('profileImage'), (req, res) => {
  const { id } = req.params;
  const registrations = readRegistrations();
  const idx = registrations.findIndex(
    (r) => r.id === id && r.userEmail.toLowerCase() === req.user.email.toLowerCase()
  );

  if (idx === -1) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(404).json({ success: false, message: 'Registration not found.' });
  }

  const existing = registrations[idx];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    userEmail: existing.userEmail,
    imageUrl: req.file ? `/uploads/${req.file.filename}` : existing.imageUrl
  };

  // Remove old image if a new one was uploaded
  if (req.file && existing.imageUrl) {
    const oldPath = path.join(process.cwd(), existing.imageUrl);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  registrations[idx] = updated;
  writeRegistrations(registrations);

  res.status(200).json({ success: true, message: 'Registration updated successfully.', data: updated });
});

// DELETE /api/registrations/:id — remove a registration
app.delete('/api/registrations/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const registrations = readRegistrations();
  const idx = registrations.findIndex(
    (r) => r.id === id && r.userEmail.toLowerCase() === req.user.email.toLowerCase()
  );

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Registration not found.' });
  }

  const toDelete = registrations[idx];

  // Remove the stored image from disk
  if (toDelete.imageUrl) {
    const imgPath = path.join(process.cwd(), toDelete.imageUrl);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  registrations.splice(idx, 1);
  writeRegistrations(registrations);

  res.status(200).json({ success: true, message: 'Registration deleted successfully.' });
});

// Global error handler (Multer errors + unexpected errors)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let msg = 'An upload error occurred.';
    if (err.code === 'LIMIT_FILE_SIZE') msg = 'Image size must be less than 2MB.';
    if (err.code === 'LIMIT_UNEXPECTED_FILE') msg = err.message || 'Invalid file type.';
    return res.status(400).json({ success: false, errors: { profileImage: msg } });
  }
  res.status(500).json({
    success: false,
    errors: { server: 'An internal server error occurred.' }
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
