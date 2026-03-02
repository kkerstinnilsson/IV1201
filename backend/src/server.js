/**
 * @file server.js
 * @description Starts the Express server for the backend REST API
 */


const app = require('./app');

/**
 * Start the server
 */
app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
