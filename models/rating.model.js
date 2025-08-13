const mongoose = require('mongoose');

const ratingSchema = mongoose.Schema({
    rating: { type: Number, required: true},
    reviews: { type: String,required:true,},
    jobId:{type:mongoose.Schema.Types.ObjectId,ref:'JobPosts',required:true},
    employeeId:{type:String,ref:'Users',required:true}
}, {
    timestamps: true,
}
);

module.exports = mongoose.model("ratings", ratingSchema);