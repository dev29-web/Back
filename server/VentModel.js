const mongoose = require("mongoose");

// Creating the schema for the transaction model fields of user id, name, description, amount, category, type, cycle, status, auto, and date
const Schema = mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
    },
    public: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    owner: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    chainName: {
      type: String,
      required: true,
    },
    token: {
      type: Boolean,
      required: true,
    },
    verified: {
      type: Boolean,
    },
    credential: {
      type: String,
    },
    //create saved thats has user address as key and whether or not its saved as value
    saved: [],
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("vents", Schema);

module.exports = Transaction;
