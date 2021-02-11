//Require Node
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//Mongoose Schema
const transactionSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: "Enter a name for transaction"
    },
    value: {
      type: Number,
      required: "Enter an amount"
    },
    date: {
      type: Date,
      default: Date.now
    }
  }
);

//Create the model
const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
