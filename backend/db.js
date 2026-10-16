
import mongoose from "mongoose";

mongoose
  .connect(
    process.env.MONGO_URI ||
      "mongodb://localhost:27017/transactionDB"
  )
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.error("Database connection Error:", err);
  });
