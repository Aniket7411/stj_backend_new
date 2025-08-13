const mongoose = require("mongoose");

const bankDetailsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
     // match: /^[0-9]{15}$/, // UK account numbers are typically 8 digits
    },
    sortCode: {
      type: String,
      required: true,
//match: /^[0-9]{6}$/, // UK sort codes are 6 digits
    },
    IBAN: {
      type: String,
     // required: true,
     // match: /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/, // General IBAN format
    },
    swiftCode: {
      type: String,
      // required: true,
    //  match: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, // General SWIFT/BIC code format
    },
    name: {
      type: String,
      required: true,
    },
     bankName: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BankDetails", bankDetailsSchema);
