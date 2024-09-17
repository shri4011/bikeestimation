// routes/estimations.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const partsList = new mongoose.Schema({
  type: String,
  company: String,
  product: String,
  price: String,
  quantity: String,
  total: String,
});

const servicingList = new mongoose.Schema({
  serviceType: String,
  serviceOption: String,
  price: String,
  quantity: String,
  total: String,
});

const bikeEstimationSchema = new mongoose.Schema({
  vehicalNumber: String,
  ownerName: String,
  mobileNumber: String,
  vehicalType: String,
  vehicalComapny: String,
  vehicalModel: String,
  servicingList: [servicingList],
  partsList: [partsList],
  billSubtotal: Number,
  payableAmount: Number,
});

const bikeEstimation = mongoose.model("Bike", bikeEstimationSchema);

// POST a new estimation
router.post("/", async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error.message);
  }
});

// GET paginated list of estimations
router.post("/getList", async (req, res) => {
  try {
    // Get the page and limit from query params, default to page 1 and limit 10 if not provided
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const sortBy = req.body.sortBy || "vehicalNumber"; // Default sorting by vehicalNumber
    const order = req.body.order === "desc" ? -1 : 1; // Ascending or descending order

    const skip = (page - 1) * limit;

    // Use bikeEstimation (the model) to count documents
    const totalDocs = await bikeEstimation.countDocuments();

    // Use bikeEstimation (the model) to find documents
    const estimations = await bikeEstimation
      .find()
      .sort({ [sortBy]: order }) // Sorting
      .skip(skip)
      .limit(limit);

    res.json({
      currentPage: page,
      totalPages: Math.ceil(totalDocs / limit),
      totalItems: totalDocs,
      itemsPerPage: limit,
      estimations,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/getList", async (req, res) => {
  try {
    // Get the page and limit from query params, default to page 1 and limit 10 if not provided
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const sortBy = req.body.sortBy || "vehicalNumber"; // Default sorting by vehicalNumber
    const order = req.body.order === "desc" ? -1 : 1; // Ascending or descending order

    const skip = (page - 1) * limit;

    // Use bikeEstimation (the model) to count documents
    const totalDocs = await bikeEstimation.countDocuments();

    // Use bikeEstimation (the model) to find documents
    const estimations = await bikeEstimation
      .find()
      .sort({ [sortBy]: order }) // Sorting
      .skip(skip)
      .limit(limit);

    res.json({
      currentPage: page,
      totalPages: Math.ceil(totalDocs / limit),
      totalItems: totalDocs,
      itemsPerPage: limit,
      estimations,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/getEstimationDetatils", async (req, res) => {
  try {
    // Find the document by _id and update it
    const updatedBikeEstimation = await bikeEstimation.findByIdAndUpdate(
      req.body?._id, // The ID from the URL
      req.body?.data, // The new data to update
      { new: true, runValidators: true } // Options: new: true returns the updated document
    );

    if (!updatedBikeEstimation) {
      return res.status(404).send("Bike estimation not found");
    }

    res.json(updatedBikeEstimation); // Send the updated document as a response
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/deleteEstimationDetatils", async (req, res) => {
  try {
    const _id = req.body?._id;
    const deleteEstimation = await bikeEstimation.findByIdAndDelete({
      _id: _id,
    });
    if (!deleteEstimation) {
      return res.status(404).send("Bike estimation not found");
    }
    res.send(deleteEstimation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const bikeEstimation2 = await bikeEstimation.findOne({
      _id: req.params.id,
    });
    if (!bikeEstimation2) {
      return res.status(404).send("Bike estimation not found");
    }
    res.json(bikeEstimation2);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
