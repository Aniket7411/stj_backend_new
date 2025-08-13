const mongoose = require('mongoose');

const inviteSchema = mongoose.Schema({
    invitedTo:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    invitedBy:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    jobId:{type:mongoose.Schema.Types.ObjectId, ref:'JobPost', required:true},
    message:{type:String, required:true},
    status:{type:Boolean, required:true, default: 'sent',enum:['sent','seen','applied']},
},
{timestamps:true}
);

module.exports = mongoose.model('Invite', inviteSchema);