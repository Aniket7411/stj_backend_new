const mongoose = require('mongoose');

const FavcandidateSchema = new mongoose.Schema({
  employerId: {
    type:String,
    required: true,
  },
  candidateId:{
    type:String,
    required:true
  },
  jobId: { // Holds the ID of the job or course
    type: mongoose.Schema.Types.ObjectId,
   // required: true,
    ref:'JobPost'
  },
  status: {
    type: Boolean,
    required: true,
    default:false
  }
},
{
  timestamps:true
}

);


module.exports = mongoose.model('Favcandidate', FavcandidateSchema);
