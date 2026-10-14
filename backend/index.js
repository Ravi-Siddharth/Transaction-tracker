require("dotenv").config()
const express = require("express");
const cors = require("cors");
require("./db.js");
const router = require("./Router.js");

const PORT = 5000;

const app = express();


app.use(cors());
app.use(express.json());
app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});