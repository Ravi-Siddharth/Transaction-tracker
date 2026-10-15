require("dotenv").config()
const express = require("express");
const cors = require("cors");
require("./db.js");
const router = require("./Router.js");

const PORT = 5000;

const app = express();


app.use(cors());
app.use(express.json());

app.use((err, req, res, next) => {
  // Log the stack trace internally for debugging
  console.error(`[ERROR] ${req.method} ${req.url} - ${err.message}`);
  console.error(err.stack);

  // Production vs Development response tracking
  const statusCode = err.statusCode || 500;
  const response = {
    status: 'error',
    message: err.message || 'Internal Server Error'
  };

    response.stack = err.stack; // Only expose stack traces in dev
  

  res.status(statusCode).json(response);
  next()
});
app.use("/api", router);

if (
  process.env.NODE_ENV !== "production"
) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  })
}
module.exports = app;