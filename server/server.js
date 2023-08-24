const express = require("express");
const cors = require("cors");

const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectDatabase = require("./dbConfig");
connectDatabase();

app.get("/", (req, res) => {
  return res.json("works");
});

const ventRoutes = require("./VentRoutes");
app.use("/api/vent", ventRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server runs on ${PORT}`);
});
