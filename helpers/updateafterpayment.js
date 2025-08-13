
const courseModels = require('../models/course.models');
const Dashboard = require('../models/dashBoard.models');
const JobPost = require('../models/postJob.models');
const User = require('../models/user.model');

//  it can be course , credit, featured
exports.updateAfterPayment=async(data)=>{
    try{
        console.log(data,".....................................8___data")
        if(data.paidFor==='credits'){
            let user = await Dashboard.findOneAndUpdate(
                { userId: data.userId },
                { $inc: { credits: data.credits } },
                { new: true } // Optional: returns the updated document
            );
            await user.save();
        }
        else if(data.paidFor==='featured'){
            let job=await JobPost.findByIdAndUpdate(data.jobId,
               {$set:{featured:true}},
               {new:true}   
            )

            await job.save();
        }
         else if(data.paidFor==='course'){
            let user=await User.findOne({userId:data.userId});
            let course=await courseModels.findByIdAndUpdate(data.courseId,
               {$push:{enrolledCandidates:{
                 name:user.name,
                email:user.email,
                contact:user.profile.personalInformation.contactNumber,
                 userId:data.userId,
               }}},
               {new:true}   
            )

            await course.save();
        }
    }
    catch(err){

    }
}


