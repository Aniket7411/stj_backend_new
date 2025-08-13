const BankDetails = require("../models/bank.model");

// ✅ Create Bank Details (POST)
exports.createBankDetails = async (req, res) => {
  try {
    const {name,bankName,accountNumber, sortCode, IBAN, swiftCode } = req.body;
    const {userId}=req.user;

    // Check if bank details already exist for the user
    const existingBankDetails = await BankDetails.findOne({ userId });
    if (existingBankDetails) {
      return res.status(400).json({
        success: false,
        message: "Bank details already exist for this user.",
      });
    }

    // Create new bank details
    const newBankDetails = new BankDetails({
      userId,
      name,
      bankName,
      accountNumber,
      sortCode,
      IBAN,
      swiftCode,
    });

    await newBankDetails.save();

    return res.status(201).json({
      success: true,
      message: "Bank details added successfully!",
      data: newBankDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error saving bank details",
      error: error.message,
    });
  }
};

// ✅ Get Bank Details by User ID (GET)
exports.getBankDetails = async (req, res) => {
  try {
    const { userId } = req.user;

    const bankDetails = await BankDetails.findOne({ userId });

    if (!bankDetails) {
      return res.status(404).json({
        success: false,
        message: "No bank details found for this user.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bank details retrieved successfully",
      data: bankDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving bank details",
      error: error.message,
    });
  }
};



// ✅ Delete Bank Details by User ID (DELETE)
exports.deleteBankDetails = async (req, res) => {
  try {
    const { userId } = req.user;

    const deletedDetails = await BankDetails.findOneAndDelete({ userId });

    if (!deletedDetails) {
      return res.status(404).json({
        success: false,
        message: "No bank details found to delete for this user.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bank details deleted successfully",
      data: deletedDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting bank details",
      error: error.message,
    });
  }
};




// ✅ Replace Bank Details by User ID (PUT)
exports.replaceBankDetails = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, bankName, accountNumber, sortCode, IBAN, swiftCode } = req.body;

    // Validate required fields for a full replace
    if (!name || !bankName || !accountNumber || !sortCode  ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required for replacing bank details.",
      });
    }

    // Find and fully replace the bank details
    const updatedBankDetails = await BankDetails.findOneAndUpdate(
      { userId },
      { name, bankName, accountNumber, sortCode, IBAN, swiftCode, userId },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Bank details replaced successfully",
      data: updatedBankDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error replacing bank details",
      error: error.message,
    });
  }
};

