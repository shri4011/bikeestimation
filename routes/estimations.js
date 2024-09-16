// routes/estimations.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const bikeEstimationSchema = new mongoose.Schema({
  vehicalNumber: String,
  ownerName: String,
  mobileNumber: Number,
  vehicalType: String,
  vehicalComapny: String,
  vehicalModel: String,
  servicingList: [
    {
      serviceType: String,
      serviceOption: String,
      price: Number,
      quantity: Number,
      total: Number,
    },
  ],
  partsList: [
    {
      type: String,
      company: String,
      product: String,
      price: Number,
      quantity: Number,
      total: Number,
    },
  ],
  billSubtotal: Number,
  payableAmount: Number,
});

const bikeEstimation = mongoose.model("Bike", bikeEstimationSchema);

// POST a new estimation
router.post("/", async (req, res) => {
  const bikeEst = new bikeEstimation({
    vehicalNumber: req.body.vehicalNumber,
    ownerName: req.body.ownerName,
    mobileNumber: req.body.mobileNumber,
    vehicalType: req.body.vehicalType,
    vehicalComapny: req.body.vehicalComapny,
    vehicalModel: req.body.vehicalModel,
    servicingList: req.body.servicingList,
    partsList: req.body.partsList,
    billSubtotal: req.body.billSubtotal,
    payableAmount: req.body.payableAmount,
  });

  await bikeEst.save();
  res.send(bikeEst);
});

// GET paginated list of estimations
router.post('/getList', async (req, res) => {
  try {
    // Get the page and limit from query params, default to page 1 and limit 10 if not provided
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const sortBy = req.body.sortBy || 'vehicalNumber'; // Default sorting by vehicalNumber
    const order = req.body.order === 'desc' ? -1 : 1;  // Ascending or descending order

    const skip = (page - 1) * limit;

    // Use bikeEstimation (the model) to count documents
    const totalDocs = await bikeEstimation.countDocuments();

    // Use bikeEstimation (the model) to find documents
    const estimations = await bikeEstimation.find()
      .sort({ [sortBy]: order }) // Sorting
      .skip(skip)
      .limit(limit);

    res.json({
      currentPage: page,
      totalPages: Math.ceil(totalDocs / limit),
      totalItems: totalDocs,
      itemsPerPage: limit,
      estimations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
