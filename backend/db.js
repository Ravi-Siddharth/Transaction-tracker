const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI||"mongodb://localhost:27017/transactionDB")
.then(() => {
    console.log("Database connection successful")
})
.catch((err) => {
    console.log("Database connection Error:", err);
});