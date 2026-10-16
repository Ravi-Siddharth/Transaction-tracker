
import "dotenv/config";
import express from "express";
import cors from "cors";
import "./db.js";

import router from "./Router.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Router diagnostics
console.log("Router type:", typeof router);
console.log("Router is function:", typeof router === "function");

if (typeof router !== "function") {
  throw new TypeError(
    "Router.js must export a valid Express router function"
  );
}

// API routes
app.use("/api", router);

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(
    `[ERROR] ${req.method} ${req.originalUrl}`,
    err.stack || err.message
  );

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message
  });
});

// Local development server
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export the Express app for Vercel
export default app;
