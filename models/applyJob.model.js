const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Job ID is required'],
    ref: 'JobPost', // Assuming there is a 'Job' collection
  },
  employerId:{
    type: String,
    required: [true, 'User ID is required'],
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  resume: {
    type: String,
    //required: [true, 'Resume link is required'],
    validate: {
      validator: function (value) {
        return /^(http|https):\/\/[^ "]+$/.test(value);
      },
      message: 'Resume must be a valid URL',
    },
  },
  coverLetter: {
    type: String,
    required: false,
    // validate: {
    //   validator: function (value) {
    //     return /^(http|https):\/\/[^ "]+$/.test(value);
    //   },
    //   message: 'Resume must be a valid URL',
    // },
  },

   fieldDocFront: {
    type: String,
    required: false,
    validate: {
      validator: function (value) {
        return /^(http|https):\/\/[^ "]+$/.test(value);
      },
      message: 'Resume must be a valid URL',
    },
  },
   fieldDocBack: {
    type: String,
    required: false,
    validate: {
      validator: function (value) {
        return /^(http|https):\/\/[^ "]+$/.test(value);
      },
      message: 'Resume must be a valid URL',
    },
  },
   fieldDocName: {
    type: String,
    required: false, 
   },
  bidAmount: {
    type: Number,
    required: [true, 'Bid amount is required'],
    min: [0, 'Bid amount must be a positive number'],
  },
  featured: {
    type: Boolean,
    default: false,
  },
  elite: {
    type: Boolean,
    default: false,
  },
  notify: {
    type: Boolean,
    default: false,
  },
  status:{
    type:String,
    default:'applied',
    enum:['applied','interviewing','closed','shortlist','reject','approved'],
    //will add or remove as per needed
  },
  username:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  contact:{
    type:String,
    required:true
  },
  specialist:{
    type:String,
  },
  jobEndDate:{
    type:Date,
    required:true
  },

}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Error handling middleware
proposalSchema.post('save', function (error, doc, next) {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    next(new Error(errors.join(', ')));
  } else {
    next(error);
  }
});

module.exports = mongoose.model('Proposal', proposalSchema);
