const { sendNotificationsToUsers } = require("../helpers/InAppNotification");
const Favcandidate = require("../models/favcandidate.model");
const postJobModels = require("../models/postJob.models");
const User = require("../models/user.model");

// POST API - Mark a candidate as favorite
exports.markAsFavorite = async (req, res) => {
  try {
    const {candidateId, status } = req.body;

    const {userId}=req.user;
    // Check if the candidate is already marked as favorite
    const existingFavorite = await Favcandidate.findOne({ employerId:userId,candidateId:candidateId });

    if (existingFavorite) {
      return res.status(400).json({ success: false, message: "Candidate is already marked as favorite." });
    }

    // Create new favorite entry
    const newFavorite = new Favcandidate({ employerId:userId, candidateId, status });
    await newFavorite.save();
    const employer=await User.findOne({userId:userId});

    //notify to user if they are marked favourite
    let notification = {
      title: "marked favourite",
      body: `your profile is marked favourite by hr at ${employer.companyName}  `,
      type: "job status update",
      isRead: false,
    };
                      
    await sendNotificationsToUsers([candidateId],notification);

    return res.status(201).json({ success: true, message: "Candidate marked as favorite.", data: newFavorite });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



//entire flow is pending ....

// GET API - Get all favorite candidates for an employer
exports.getFavoriteCandidates = async (req, res) => {
  try {
    const { userId } = req.users;

    const favoriteCandidates = await Favcandidate.find({ employerId }).populate("jobId") // Populate job details
     // .exec();

    return res.status(200).json({ success: true, data: favoriteCandidates });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
