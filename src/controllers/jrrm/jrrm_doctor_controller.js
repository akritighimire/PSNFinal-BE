const JrrmDoctor = require("../../models/jrrm_doctor_schema");
const mongoose = require("mongoose");

const addDoctor = async (req, res) => {
  try {
    const {
      fullName,
      batch,
      degree,
      email,
      workingPlace,
      address,
      nmcNumber,
      specialization,
      phoneNumber,
    } = req.body;
    console.log(req.file);
    const photo = req.file ? req.file.filename : "";

    if (
      !fullName ||
      !batch ||
      !degree ||
      !email ||
      !workingPlace ||
      !address ||
      !nmcNumber ||
      !specialization ||
      !phoneNumber
    ) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    // Check if doctor with same email already exists
    const existingDoctor = await JrrmDoctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ 
        message: "This email is already registered. Please use a different email address.",
        existingDoctor: {
          id: existingDoctor._id,
          fullName: existingDoctor.fullName
        }
      });
    }

    const data = new JrrmDoctor({
      fullName,
      batch,
      degree,
      email,
      workingPlace,
      photo,
      address,
      nmcNumber,
      specialization,
      phoneNumber,
    });

    await data.save();
    // Send the response including the doctor's id
    return res.status(200).json({
      message: "Form has been submitted",
      id: data._id, // Return the ID of the newly created doctor
    });
  } catch (error) {
    res.status(400).json({ message: "Error adding doctor", error });
    console.log(error);
  }
};

// Controller for fetching the list of doctors

const getDoctors = async (req, res) => {
  try {
    const doctors = await JrrmDoctor.find();
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors", error });
  }
};

// Controller for searching a doctor
const searchDoctor = async (req, res) => {
  try {
    const { query } = req.query; // Get the search query from URL params

    // Find doctors by matching any of the fields
    const doctors = await JrrmDoctor.find({
      $or: [
        { fullName: { $regex: query, $options: "i" } }, // Case-insensitive search for fullName
        { batch: { $regex: query, $options: "i" } }, // Case-insensitive search for batch
        { specialization: { $regex: query, $options: "i" } }, // Case-insensitive search for specialization
        { nmcNumber: { $regex: query, $options: "i" } }, // Case-insensitive search for NMC No
        { workingPlace: { $regex: query, $options: "i" } }, // Case-insensitive search for workplace
      ],
    });

    if (doctors.length === 0) {
      return res.status(404).json({ message: "No doctors found" });
    }

    res.json(doctors); // Return the list of matching doctors
  } catch (error) {
    console.error("Error searching for doctor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller for updating a doctor's details by ID
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedDoctor = await JrrmDoctor.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (updatedDoctor) {
      res.status(200).json({
        message: "Doctor updated successfully",
        doctor: updatedDoctor,
      });
    } else {
      res.status(404).json({ message: "Doctor not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error updating doctor", error });
  }
};

// Controller for deleting a doctor by ID
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: "Invalid doctor ID format",
        providedId: id 
      });
    }

    // First check if the doctor exists
    const doctor = await JrrmDoctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ 
        message: "Doctor not found",
        providedId: id 
      });
    }

    // Attempt to delete the doctor
    const deletedDoctor = await JrrmDoctor.findByIdAndDelete(id);
    
    if (deletedDoctor) {
      res.status(200).json({
        message: "Doctor deleted successfully",
        doctor: deletedDoctor,
      });
    } else {
      res.status(404).json({ 
        message: "Doctor not found or already deleted",
        providedId: id 
      });
    }
  } catch (error) {
    console.error("Delete doctor error:", error);
    res.status(500).json({ 
      message: "Error deleting doctor", 
      error: error.message,
      stack: error.stack 
    });
  }
};

module.exports = {
  addDoctor,
  getDoctors,
  searchDoctor,
  updateDoctor,
  deleteDoctor,
};
