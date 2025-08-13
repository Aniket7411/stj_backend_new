const { sendNotificationsToUsers } = require('../helpers/InAppNotification');
const applyJob = require('../models/applyJob.model'); // Assuming the Proposal model is saved in ./models/proposal
const Dashboard = require('../models/dashBoard.models');
const postJob = require('../models/postJob.models');
const User = require('../models/user.model');
const { updateDashboard, updateJobCredits, updateBids } = require('./dashboard.controller');


// POST API to apply for a job


exports.createJobApply =
  async (req, res) => {
    try {
      const { jobId, description, resume, coverLetter, bidAmount, featured, elite, notify, username, email, contact, specialist } = req.body;

      const { userId } = req.user
      console.log(req.user, ".........14")
      if (req.user.role !== "employee") {
        return res.status(400).json({ message: "Only employee can apply for jobs" });
      }

      const requiredjob = await postJob.findById(jobId);

      if(requiredjob.jobDetails.applicationDeadline<new Date()){
        return res.status(400).send({
          success:false,
          message:"this job is not active"
        })
      }

      //check the lastCreditRenewel
      // const currentDate = new Date();
      //  let  oneMonthAgo = new Date();
      //   oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const employee = await Dashboard.findOne({ userId: userId });

      // if (employee.lastCreditRenewal < oneMonthAgo) {
      //   console.log("check here")
      //   employee.credits += 20;
      //   employee.lastCreditRenewal = currentDate;
      //   await employee.save();
      // }


      // console.log(employee,"..........36")


      // if(employee?.credits<0){
      //   return res.status(403).send({
      //     success:false,
      //     message:"you need to buy more credits to apply for job"
      //   })
      // }

      //if user apply for same job twice , we need to prevent it....
      const checkApply = await applyJob.findOne({ jobId: jobId, userId: userId });
      if (checkApply) {
        return res.status(400).send({
          success: false,
          message: "cannot re-submit the application for same job."
        })
      }

      const newProposal = new applyJob({
        jobId,
        userId: userId,
        employerId:requiredjob.createdBy,
        description,
        resume,
        coverLetter,
        bidAmount,
        featured,
        elite,
        notify,
        username,
        email,
        contact,
        specialist,
        jobEndDate: new Date(new Date(requiredjob.workSchedule.startDate).getTime() + requiredjob.workSchedule.duration * 86400000)
      });

      updateDashboard(userId, "create");//create the dashboard
      updateJobCredits({ userId });//create the dashboard

      const savedProposal = await newProposal.save();
      const job = await postJob.findOne({ _id: jobId });


      let notification = {
        title: "you have a new job application",
        body: `A new job application for post ${job.jobDetails.jobTitle} is recieved `,
        type: "new job applicant",
        isRead: false,
      };

      await sendNotificationsToUsers([job.createdBy], notification);

      res.status(201).json({ message: 'Job application submitted successfully', proposal: savedProposal });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
// app.post('/apply', );
// GET API to get all applied jobs by jobId or userId
//userId--check jobs applied by a particular user
//jobId--number of applicants & biddings  for that job 
exports.getJobApply = async (req, res) => {
  try {
    console.log(req.query, "............42")
    const { Id, type, status } = req.query;
    let proposals = [];
    const { role } = req.user;
    console.log(role,"...................................107")
    //this type is for employer end to see number of people applied for a particular job
    if (type === 'jobId' && role === 'employer') {
      //console.log('reached')     
      proposals = await applyJob.find({ jobId: Id, status: status,employerId:req.user.userId });
    }
    //this type is for employee end to see all the jobs he has applied till now
    else if (type === 'userId' && role === 'employee') {
      proposals = await applyJob.find({ userId: Id });
    }
    else if (role === 'admin') {
      proposals = await applyJob.find({ jobId: Id, status: status, });
    }
    else {
      return res.status(404).send({
        message: "missing payload"
      })
    }





    // if (proposals.length === 0) {
    //   return res.status(404).json({ message: 'No proposals found for this job ID' });
    // }

    res.status(200).json(proposals);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}



exports.getJobCompleted = async (req, res) => {
  try {

    const {userId}=req.user;
    const allJobs = await applyJob
      .find({ userId: userId }).select('status jobEndDate updatedAt')
      .populate('jobId','companyDetails.companyName jobDetails.jobTitle jobDetails.jobAddress');

    const jobCreated = allJobs;

    const activeJob = allJobs.filter(job =>
      job.status === 'approved' && job.jobEndDate > job.updatedAt
    );

    const completedJob = allJobs.filter(job =>
      job.status === 'approved' && job.jobEndDate < job.updatedAt
    );


    return res.status(200).send({
      success: true,
      jobCreated:allJobs,
      activeJob:activeJob,
      completedJob:completedJob
    })

  } catch (err) {
    return res.status(500).send({
      message: err.message,
      success: false
    })
  }
}


//update the status of job application
exports.updateJobApply = async (req, res) => {
  try {
    const { status, proposalId } = req.body
    const updatedProposal = await applyJob.findByIdAndUpdate(proposalId, {
      $set: {
        status: status,
      },
    })
    await updatedProposal.save();
    //Send Notification to the specific user who applied for this job.
    const job = await postJob.findById(updatedProposal.jobId);
    let notification = {
      title: "your job application is updated",
      body: `your proposal for ${job.jobDetails.jobTitle} has been ${status}ed`,
      type: "job status update",
      isRead: false,
    };

    //Send Notification to all users who need notification if not selected.
    if (status === 'approved') {
     let rejectedUsers = await applyJob.find({
  notify: true,
  jobId: updatedProposal.jobId,
  status: { $ne: 'approved' }
})
.select('userId')
.lean();

let userIds = rejectedUsers.map(user => user.userId);

      let notification = {
        title: "your job application is updated",
        body: `your proposal for ${job.jobDetails.jobTitle} has been granted to other user`,
        type: "job status update",
        isRead: false,
      };

      await sendNotificationsToUsers(userIds, notification);

    }

    await sendNotificationsToUsers([updatedProposal.userId], notification);
    //if the status is approved , update winning bid of user
    await updateBids(updatedProposal.userId, status, proposalId)

    //if the status is rejected, update losing bid of user
    //if the status is completed,update completed job of user  
    return res.status(200).send({
      message: "updated status"
    })
  } catch (err) {
    return res.status(400).send({
      message: err?.message
    })
  }
}









