// routes/estimations.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const multer = require("multer");
const bodyParser = require("body-parser");
const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");
require("jspdf-autotable");

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
  pdfUrl: String,
});

const bikeEstimation = mongoose.model("Bike", bikeEstimationSchema);

const imageSchema = new mongoose.Schema({
  title: String,
  image: {
    data: String,
    contentType: String,
  },
});

const Image = mongoose.model("Image", imageSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage });
// POST a new estimation
router.post("/", async (req, res) => {
  try {
    const doc = new jsPDF();

    const vehicleDetails = {
      vehicalNumber: req?.body?.vehicalNumber || "NA",
      ownerName: req?.body?.ownerName || "NA",
      mobileNumber: req?.body?.mobileNumber || "NA",
      vehicalType: req?.body?.vehicalType || "NA",
      vehicalComapny: req?.body?.vehicalComapny || "NA",
      vehicalModel: req?.body?.vehicalModel || "NA",
    };

    const image = await Image.find()?.sort({ createdAt: -1 });
    if (!image) {
      return res.status(404).send("Image not found.");
    }
    const length = image?.length || 1;

    let getImage = "";
    let base64Image = "";
    let title = "default title";
    if (length > 0) {
      getImage = image[length - 1];
      title = getImage?.title;
      base64Image = getImage?.image?.data?.toString("base64");
    }

    doc.addImage(base64Image, "PNG", 171, 10, 25, 24);

    // Add a title
    doc.setFontSize(18);
    doc.text(title, 14, 22);

    // Add Vehicle Details
    doc.setFontSize(14);
    doc.text("Vehicle Details", 14, 30);
    doc.autoTable({
      startY: 35,
      head: [
        [
          "Vehicle Number",
          "Owner Name",
          "Mobile Number",
          "Vehicle Type",
          "Vehicle Company",
          "Vehicle Model",
        ],
      ],
      body: [
        [
          vehicleDetails.vehicalNumber,
          vehicleDetails.ownerName,
          vehicleDetails.mobileNumber,
          vehicleDetails.vehicalType,
          vehicleDetails.vehicalComapny,
          vehicleDetails.vehicalModel,
        ],
      ],
    });

    // Add a Parts List Table
    doc.text("Parts List", 14, doc.lastAutoTable.finalY + 10);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [["Type", "Company", "Product", "Price", "Quantity", "Total"]],
      body: req?.body?.partsList.map((part) => [
        part.type,
        part.company,
        part.product,
        part.price,
        part.quantity,
        part.total,
      ]),
    });

    // Add a Servicing List Table
    doc.text("Servicing List", 14, doc.lastAutoTable.finalY + 10);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [["Service Type", "Service Option", "Price", "Quantity", "Total"]],
      body: req?.body?.servicingList.map((service) => [
        service.serviceType,
        service.serviceOption,
        service.price,
        service.quantity,
        service.total,
      ]),
    });

    doc.text("Amount Details", 14, doc.lastAutoTable.finalY + 10);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [["Bill sub total", "Payable amount"]],
      body: [[req?.body?.billSubtotal, req?.body?.payableAmount]],
    });

    // Save the PDF to the server
    const pdfFilePath = path.join(
      __dirname,
      "..",
      "public",
      `${req?.body?.vehicalNumber}.pdf`
    );
    // fs.writeFileSync(pdfFilePath,); // Save the generated PDF

    await fs.writeFile(pdfFilePath, doc.output(), "binary", (err) => {
      if (err) {
        console.error("Error writing PDF to file:", err);
        throw err;
      } else {
        console.log(`PDF saved successfully at ${pdfFilePath}`);
      }
    });

    const pdfUrl = `https://bikeestimation-2.onrender.com/public/${req?.body?.vehicalNumber}.pdf`;

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
      pdfUrl: pdfUrl,
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

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const base64File = req.file.buffer.toString("base64");
    // const binaryImage = base64File.toString();

    const newImage = new Image({
      title: req.body.title,
      image: {
        data: base64File,
        contentType: req.file.mimetype,
      },
    });

    await newImage.save();
    res.status(200).json({ message: "Image and title uploaded successfully." });
  } catch (error) {
    console.error("Error saving image:", error);
    res.status(500).json({ message: "Error saving image to database." });
  }
});

router.post("/images", async (req, res) => {
  try {
    const image = await Image.find().sort({ createdAt: -1 });
    if (!image) {
      return res.status(404).send("Image not found.");
    }
    const length = image?.length || 1;

    if (length > 0) {
      const getImage = image[length - 1];
      const base64Image = getImage.image.data.toString("base64");
      res.send({
        title: getImage.title,
        image: `${base64Image}`,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving image.", error });
  }
});

module.exports = router;
