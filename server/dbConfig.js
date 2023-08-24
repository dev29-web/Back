const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

//Mongo database credentials
const username = process.env.db_username;
const password = process.env.db_password;

const dbname = "vent";
const uri = `mongodb+srv://${username}:${password}@clusterdb.ok95nts.mongodb.net/${dbname}?retryWrites=true&w=majority`;

async function connectDatabase() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    //verification
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error: "));
    db.once("open", function () {
      console.log("Connected successfully");
    });
  } catch (error) {
    console.error(error);
  }
}

module.exports = connectDatabase;
