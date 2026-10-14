const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/transactionDB")
.then(() => {
    console.log("Database connection successful")
})
.catch((err) => {
    console.log("Database connection Error:", err);
});