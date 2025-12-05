/**
 * @file server.ts
 * @description Service entry point. Starts the Express server and
 * listens on the configured port using environment variables or a default value.
 */

import app from "./app";

const PORT = process.env.PORT || 8080;

/**
 * Initializes the HTTP server using the Express instance.
 *
 * The server:
 * - Reads the port from the environment variable `PORT` (ideal for Render, Railway, or Docker)
 * - Prints a message to the console when it is ready
 *
 * @function listen
 * @example
 * // Typical execution:
 * npm start
 *
 * // Output:
 * Auth service running on port 8080
 */
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
