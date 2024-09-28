// app.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

// Create an Express app
//https://bike-estimation.netlify.app
const isProd = process.env.IS_PROD;
const CORS_API_URL = isProd === "true" ? "https://bike-estimation.netlify.app" : "http://localhost:3000";
const app = express();
const corsOptions = {
  origin: CORS_API_URL, // Allow your frontend's origin
  methods: ["GET", "POST"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // If you need to allow cookies/authentication
};

app.use(cors(corsOptions));
// app.use(cors());

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
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));
const bikeRoutes = require("./routes/estimations");
const { env } = require("process");

app.use("/api/bikesEstimation", bikeRoutes);

// Start the server
const port = process.env.PORT || 5050;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
