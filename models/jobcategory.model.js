const mongoose = require('mongoose');

const jobCategorySchema = new mongoose.Schema({
  categoryName: {
    type:String,
    required: true,
  },
},
{
  timestamps:true
}


);



module.exports = mongoose.model('jobCategory',jobCategorySchema );
