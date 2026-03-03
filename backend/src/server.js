/**
 * @file server.js
 * @description Starts the Express server for the backend REST API
 */

// Process-level errors
if (!process.env.SESSION_SECRET) {
  console.error("FATAL ERROR: SESSION_SECRET is not defined");
  process.exit(1);
}

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
  process.exit(1);
});


const app = require('./app');

/**
 * Start the server
 */
app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
