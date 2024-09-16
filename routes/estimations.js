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
  servicingList: Array,
  partsList: Array,
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

module.exports = router;
