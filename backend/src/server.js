/**
 * @file server.js
 * @description Entry point for the backend REST API
 */

require('dotenv').config({ path: __dirname + '/../.env' });
const express = require("express");
const cors = require("cors");
const applicationsController = require("./presentation/applicationsController");

const app = express();

// Enable CORS for frontend
app.use(cors({ origin: "http://localhost:5173" }));

// Enable JSON parsing
app.use(express.json());

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
app.use("/applications", applicationsController);

/**
 * Start the server
 */
app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
