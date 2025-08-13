const applyJobModel = require('../models/applyJob.model');
const Dashboard = require('../models/dashBoard.models');
const postJobModels = require('../models/postJob.models');
const User = require('../models/user.model');
const createDashboard = async (request) => {
    try {
        console.log(">>>>", request)
        let { role, userId, profileCompleted, credits } = request;
        let user;
        if (!role || !profileCompleted) {
            user = await User.findOne({ userId });
            if (!role)
                role = user.role;

            if (!profileCompleted)
                profileCompleted = user.profile.profileCompletion;
        }

        const userDashboard = await Dashboard.create({ role, userId, profileCompleted, credits });
        console.log(userDashboard);
    } catch (error) {
        console.log(error);
        throw new Error("Error at creating Dashboard");
    }
}

const getDashboard = async (req, res) => {
    try {
        // console.log("reached")
        const { userId, role } = req?.user;
        //jobInvites, activeJob, completedJob, createdJobs.
        let statusCounts, userDashboard;
        if (role === 'employer') {
            //console.log("reached")
            const user = await User.findOne({ userId: userId });
            statusCounts = await postJobModels.aggregate([
                {
                    $match: {
                        createdBy: userId,
                        'workSchedule.startDate': { $exists: true }
                    }
                },
                {
                    $project: {
                        status: {
                            $cond: [
                                {
                                    $or: [
                                        { $gte: ['$workSchedule.startDate', new Date()] },
                                        // { $gt: ['$jobDetails.applicationDeadline', new Date()] }
                                    ]
                                },
                                'active',
                                'completed'
                            ]
                        }
                    }
                },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);



            let profileCompleted = calculateProfileCompletion(user.profile);

            // console.log(profileCompleted,"..................59")



            console.log("statusCountsstatusCountsstatusCountsstatusCounts", statusCounts)



            //console.log("reached")
            userDashboard = await Dashboard.findOneAndUpdate({ userId: userId }, {
                $set: {
                    activeJobs: statusCounts.find(item => item._id === 'active').count || 0,
                    completedJobs: statusCounts.find(item => item._id === 'completed').count || 0,
                    jobCreated: statusCounts[0].count + statusCounts[1].count || 0,
                    profileCompleted: profileCompleted
                }
            },
                { new: true }

            )


            await userDashboard.save();





            // console.log(statusCounts, "");
        }
        //pending work
        else if (role === 'employee') {
            statusCounts = await applyJobModel.aggregate([
                {
                    $match: {
                        userId: userId
                    }
                },
                {
                    $facet: {
                        jobCreated: [
                            {
                                $count: 'count'
                            }
                        ],
                        activeJob: [
                            {
                                $match: {
                                    status: 'approved',
                                    $expr: { $gt: ['$jobEndDate', '$updatedAt'] }
                                }
                            },
                            {
                                $count: 'count'
                            }
                        ],
                        completedJob: [
                            {
                                $match: {
                                    status: 'approved',
                                    $expr: { $lt: ['$jobEndDate', '$updatedAt'] }
                                }
                            },
                            {
                                $count: 'count'
                            }
                        ]
                    }
                },
                {
                    $project: {
                        jobCreated: { $arrayElemAt: ['$jobCreated.count', 0] },
                        activeJob: { $arrayElemAt: ['$activeJob.count', 0] },
                        completedJob: { $arrayElemAt: ['$completedJob.count', 0] }
                    }
                }
            ]);

            const counts = statusCounts[0] || {};
            const jobCreated = counts.jobCreated || 0;
            const activeJob = counts.activeJob || 0;
            const completedJob = counts.completedJob || 0;



            //console.log(active,"...........",complete)

            userDashboard = await Dashboard.findOneAndUpdate({ userId: userId }, {
                $set: {
                    activeJobs: activeJob,
                    completedJobs: completedJob,
                    jobCreated: jobCreated,
                    // profileCompleted:profileCompleted
                }
            },
                { new: true }

            )


            await userDashboard.save();
        }

        return res.status(200).json({ success: true, userDashboard, statusCounts });

    } catch (error) {
        console.log(error?.message)
        return res.status(500).json({ message: error.message });
    }
}

const updateDashboard = async (userId, status) => {
    try {
        console.log(userId, status, "......40")
        const dashboard = await Dashboard.findOne({ userId });
        console.log(dashboard, "......42")
        if (status === "create") {
            dashboard.jobCreated = dashboard.jobCreated + 1;
        }
        if (status === "invite") {
            dashboard.jobInvites = dashboard.jobInvites + 1;
        }
        if (status === "complete") {
            dashboard.jobCompleted = dashboard.jobCompleted + 1;
        }
        //if(profileCompleted)
        await dashboard.save();
        // await Dashboard.findAndUpdateOne({userId}, {request});
    } catch (error) {
        console.log(error.message)
        throw new Error("Error at updating Dashboard");
    }
}



const updateJobCredits = async (request) => {
    try {
        const { userId } = request;
        console.log(userId, "------66")
        const dashboard = await Dashboard.findOneAndUpdate({ userId },
            {
                $inc: {
                    credits: -1,               // Decrease the credits field by 1
                    "bids.ongoingBids": +1     // Increase the ongoingBids field by 1
                }
            },
            { new: true } // Return the updated document
        );

        await dashboard.save();
        // await Dashboard.findAndUpdateOne({userId}, {request});
    } catch (error) {
        throw new Error("Error at updating Dashboard");
    }
}


const updateBids = async (userId, status, proposalId) => {
    try {

        console.log(userId, status, "------66")
        const updateQuery = {
            $inc: {},
            $push: {}
        };
        if (status === 'approved') {
            const dashBoard = await Dashboard.findOne({ userId: userId, 'bids.winnigBidsArray': proposalId });
            if (!dashBoard) {
                updateQuery.$inc["bids.winnigBids"] = 1;
                updateQuery.$inc["bids.ongoingBids"] = -1;
                updateQuery.$push["bids.winnigBidsArray"] = proposalId;
            }


        } else if (status === 'reject') {
            const dashBoard = await Dashboard.findOne({ userId: userId, 'bids.lostBidsArray': proposalId });
            if (!dashBoard) {
                updateQuery.$inc["bids.lostBids"] = 1;
                updateQuery.$push["bids.lostBidsArray"] = proposalId;
                updateQuery.$inc["bids.ongoingBids"] = -1;
            }
            //updateQuery.$inc["bids.lostBids"] = 1;
            //updateQuery.$push["bids.lostBidsArray"]=proposalId;
        }

        await Dashboard.updateOne({ userId: userId }, updateQuery);
        //console.log(Dashboard)

        //await dashboard.save();
        // await Dashboard.findAndUpdateOne({userId}, {request});
    } catch (error) {
        throw new Error("Error at updating Dashboard");
    }
}

const calculateProfileCompletion = (profile) => {
    const fieldsToCheck = [
        // Personal Information Fields
        'personalInformation.contactNumber',
        'personalInformation.paypalEmail',
        'personalInformation.dob',
        'personalInformation.gender',
        'personalInformation.nationality',
        'personalInformation.address.address',
        'personalInformation.address.postCode',
        'personalInformation.address.country',
        'personalInformation.address.town',
        'personalInformation.address.city',

        // General Information Fields
        'generalInformation.height',
        'generalInformation.build',
        'generalInformation.language',
        'generalInformation.utrNumber',
        'generalInformation.alignments',
        'generalInformation.healthIssue',
        'generalInformation.travelWill',
        'generalInformation.millitaryBackground',
        'generalInformation.ukDrivingLicense',
        'generalInformation.paramedicTraining',
        'generalInformation.piercing',
        'generalInformation.abroadTravel',
        'generalInformation.siaBadge',
        'generalInformation.drive',
        'generalInformation.firstAid',
        'generalInformation.tattoo',
        'generalInformation.workPermit',
        'generalInformation.cscs',
        'generalInformation.passportDrivingLicense',
        'generalInformation.utilityBillStatement',
        'generalInformation.bio',
        'generalInformation.experience',

        // Uploads Fields
        'uploads.educationalCertificates',
        'uploads.passportDrivingLicense',
        'uploads.essentialDocuments',
        'uploads.videos',
    ];

    let completedFields = 0;

    fieldsToCheck.forEach((field) => {
        const keys = field.split('.');
        let value = profile;

        for (const key of keys) {
            if (value && value[key] !== undefined && value[key] !== null && value[key] !== '') {
                value = value[key];
            } else {
                return; // Skip if the field is not filled
            }
        }
        completedFields++;
        //console.log(completedFields);
    });

    return Math.round((completedFields / fieldsToCheck.length) * 100);
};




module.exports = {
    createDashboard, getDashboard, updateDashboard, updateJobCredits, updateBids
}