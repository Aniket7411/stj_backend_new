const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  createdBy: {
    type:String,
    required: true,
  },
  referenceId: { // Holds the ID of the job or course
    type: mongoose.Schema.Types.ObjectId,
    //required: true,
    ref:'Course'
  },
  jobId: { // Holds the ID of the job or course
    type: mongoose.Schema.Types.ObjectId,
   // required: true,
    ref:'JobPost'
  },
  type: { // Either 'job' or 'course'
    type: String,
    enum: ['job', 'course'],
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
},
{
  timestamps:true
}


);

BookmarkSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Bookmark', BookmarkSchema);
