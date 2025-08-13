const mongoose = require('mongoose');
const dashBoardSchema = mongoose.Schema({
    userId:{type:String, ref:'User', required:true},
    role:{type:String, required:true},
    credits:{
        type:Number,
        required:true,
        default:20
    },
    jobCreated:{type:Number, required:true, default:0},
    activeJobs:{type:Number, required:true, default:0},
    jobInvites:{type:Number, required:true, default:0},
    completedJobs:{type:Number, required:true, default:0},
    profileCompleted:{type:Number, required:true, default:0},
    bids:{
        lostBids:{type:Number, default:0},
        ongoingBids:{type:Number, default:0},
        winnigBids:{type:Number, default:0},
        lostBidsArray:{type:[Array]},
        winnigBidsArray:{type:[Array]},
    },
    lastCreditRenewal: {
        type: Date,
        required: function () {
          return this.role === 'employee';
        },
        default: function () {
          return this.role === 'employee' ? new Date() : null;
        },
      },
},
{
    timestamps:true
}

)

const userRole = function(){role==='employer'};


module.exports = mongoose.model('Dashboard', dashBoardSchema);