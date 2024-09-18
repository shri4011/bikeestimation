// app.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Create an Express app
const app = express();
const corsOptions = {
    origin: 'http://localhost:3000', // Allow your frontend's origin
    methods: ['GET', 'POST'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // If you need to allow cookies/authentication
  };
  
  // app.use(cors(corsOptions));
  app.use(cors());

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
const port = process.env.PORT || 5050;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
