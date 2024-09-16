// app.js
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

// Create an Express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB;
const mongoUrl = process.env.MONGO_URL;
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

const bikeRoutes = require("./routes/estimations");
app.use("/api/bikesEstimation", bikeRoutes);

// Start the server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
