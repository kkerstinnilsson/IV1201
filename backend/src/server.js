/**
 * @file server.js
 * @description Entry point for the backend REST API
 */

require('dotenv').config({ path: __dirname + '/../.env' });

const express = require("express");
const cors = require("cors");
const session = require('express-session');

const applicationsController = require("./presentation/routes/applicationsRoutes");
const authRoutes = require('./presentation/routes/authRoutes');

const app = express();

// Enable CORS for frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

// Enable JSON parsing
app.use(express.json());

/**
 * Session middleware for authentication.
 *
 * Stores authenticated user information and
 * uses a signed HTTP-only cookie to identify the user between requests.
 */
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // set to true in production when using HTTPS
  },
}));

/**
 * Health check route
 */
app.get("/", (req, res) => {
  res.send("Hello backend");
});

/**
 * Applications API
 * Routes prefixed with /applications
 */
app.use("/applications", applicationsRoutes);


/**
 * Authentication API.
 */
app.use('/auth', authRoutes);

/**
 * Start the server
 */
app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
