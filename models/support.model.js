const mongoose = require('mongoose');

const supportAndFeedbackSchema = mongoose.Schema({
    email: { type: String, required: true,},
    name: { type: String, required: true, },
    message:{type:String,required:true},
}, {
    timestamps: true,
}
);

module.exports = mongoose.model("supportAndFeedback", supportAndFeedbackSchema);