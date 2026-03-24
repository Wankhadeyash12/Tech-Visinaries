require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/pages/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/pages/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/pages/register.html'));
});

app.get('/browse-events', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/pages/browse-events.html'));
});

app.get('/organizer-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/pages/organizer-dashboard.html'));
});

app.get('/create-event', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/pages/create-event.html'));
});

app.get('/event-details', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/pages/event-details.html'));
});

app.get('/participate', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/pages/participate.html'));
});

app.get('/participant-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/pages/participant-dashboard.html'));
});

app.get('/analytics', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/pages/analytics.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 FlexHub Server running on port ${PORT}`);
});
