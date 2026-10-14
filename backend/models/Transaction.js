const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required:true,
        enum:["income","expense"]
    },
    date: {
        type: String,
        required: true
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref:"User"
    }
});
const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;