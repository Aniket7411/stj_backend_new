const Dashboard = require('../models/dashBoard.models');
const JobPost = require('../models/postJob.models'); // Assuming the schema file is named `jobPost.js`
// const axios = require('axios');
const { faker } = require('@faker-js/faker');
const { createDashboard, updateDashboard, updateJobCredits } = require('../controllers/dashboard.controller');
const bookmarkModel = require('../models/bookmark.model');
const User = require('../models/user.model');
const applyJobModel = require('../models/applyJob.model');
const { sendNotificationsToUsers } = require('../helpers/InAppNotification');
const postJobModels = require('../models/postJob.models');


const jobPostController = {
    // Create a new job post
    createJobPost: async (req, res) => {

        console.log("minimumQualification", req.body)
        try {
            console.log(req.body, ".................13");
            const { userId } = req.user
            console.log(userId, ".................1");
            if (req.user.role !== "employer") {
                return res.status(400).json({ message: "Only employer can create jobs" });
            }

            const user = User.findOne({ userId });

            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }
            // req.body.employerName = user.name;
            const jobPost = new JobPost(req.body);



            jobPost.createdBy = userId;
            const savedJobPost = await jobPost.save();
            const dashboard = await Dashboard.findOne({ userId });
            // console.log(">>>>>>", dashboard);
            let Existingjobs = 0;
            //if dashboard does not exist
            console.log("hello");
            updateDashboard(userId, "create");//create the dashboard
            updateJobCredits({ userId });//create the dashboard
            const jobs = await JobPost.find({ createdBy: userId });
            Existingjobs = jobs.length;


            //notification for employee who belong to same profession or category.....
            const users = await User.aggregate([
                {
                    $match: {
                        role: 'employee'
                    }
                },
                {
                    $project: {
                        lastExperience: { $arrayElemAt: ['$profile.generalInformation.experience', -1] },
                        userId: 1
                    }
                },
                {
                    $match: {
                        'lastExperience.title': savedJobPost.jobDetails.jobTitle
                    }
                }
            ]);

            console.log(users, "......................................62");


            if (users) {
                let userIds = users.map(item => (item.userId));
                let notification = {
                    title: "you have a new job recommandation",
                    body: `a new job is posted on ${savedJobPost.createdAt} which matches your profession.check it out.`,
                    type: "new job alert",
                    isRead: false,

                }
                await sendNotificationsToUsers(userIds, notification)
            }



            res.status(201).json({ success: true, message: 'Job post created successfully', data: savedJobPost });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error creating job post', error: error.message });
        }
    },

    // Get all job posts
    getAllJobPosts: async (req, res) => {
        try {
            const userId = req?.user?.userId;

            const { page = 1, experience, category, salaryRange, dateRange, keyword, place, distanceRange, sortBy } = req.query;

            const limit = 21;
            const skip = limit * (page - 1);

            // Build the filter object
            const filters = {};

            // Apply keyword filter
            if (keyword) {
                filters["$or"] = [
                    { "jobDetails.jobTitle": { $regex: keyword, $options: "i" } },
                    { "jobDetails.jobCategory": { $regex: keyword, $options: "i" } },
                    { "jobDetails.jobDescription": { $regex: keyword, $options: "i" } },
                    { "companyDetails.companyName": { $regex: keyword, $options: "i" } },
                    { "jobRequirements.jobSkills": { $regex: keyword, $options: "i" } }
                ];
            }

            // Handle place filtering (city, state, country) where commas or spaces can be used
            if (place) {
                // Normalize the place string by replacing commas with spaces and then splitting by spaces
                const placeParts = place.replace(/,/g, ' ').split(/\s+/).map(part => part.trim()).filter(Boolean); // Replace commas, split by spaces, trim and filter empty parts

                if (placeParts.length > 0) {
                    // Build the $or filter dynamically for each place part
                    const placeFilter = placeParts.map(part => ({
                        $or: [
                            { "jobDetails.city": { $regex: part, $options: "i" } },
                            { "jobDetails.state": { $regex: part, $options: "i" } },
                            { "jobDetails.country": { $regex: part, $options: "i" } }
                        ]
                    }));

                    // Combine the filters using $or for dynamic parts
                    filters["$or"] = placeFilter;
                }
            }

            // Apply experience filter
            if (experience) {
                console.log(experience, ".............88")
                try {
                    let convertedData = JSON.parse(experience);

                    filters["jobRequirements.minimumExp"] = { $gte: convertedData.minimumExp };
                    filters["jobRequirements.maximumExp"] = { $lte: convertedData.maximumExp };
                } catch (err) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid experience format. Expected JSON.",
                    });
                }
            }


            // Apply salary range filter
            if (salaryRange) {
                try {
                    const { minSalary = 0, maxSalary = Number.MAX_VALUE } = JSON.parse(salaryRange);
                    filters["jobDetails.salary.amount"] = { $gte: minSalary, $lte: maxSalary };
                } catch (err) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid salaryRange format. Expected JSON.",
                    });
                }
            }

            // Apply date range filter
            if (dateRange) {

                const { startRange, endRange } = JSON.parse(dateRange);
                // console.log(startRange>"2025-02-10","..............133")
                filters["createdOn"] = {
                    $gte: startRange,
                    $lte: endRange,
                };
                //console.log(filters,".................138")
            }

            // Apply category filter
            if (category) {
                const categories = category.split(","); // Split categories if passed as a comma-separated string
                filters["jobDetails.jobCategory"] = { $in: categories };
            }


            //console.log(filters,"...............130")
            //
            //   hey , I have a payload sortBy which will send time and price . if sortBy is their then only sort it


            let sortCriteria = { featured: -1 }; // Always sort by featured first

            if (sortBy) {
                console.log(sortBy, ".......uuuuuuuuuuuuuuuuuuuuuuuuuuuu");
                if (sortBy?.time === '-1') {
                    sortCriteria.createdAt = -1; // Sort by newest first
                } else if (sortBy?.time === '1') {
                    sortCriteria.createdAt = 1; // Sort by oldest first
                }

                if (sortBy?.price === '-1') {
                    sortCriteria["jobDetails.salary.amount"] = -1; // Sort by highest salary first
                } else if (sortBy?.price === '1') {
                    sortCriteria["jobDetails.salary.amount"] = 1; // Sort by lowest salary first
                }
            }

            let jobPosts = await JobPost.find(filters)
                .sort(sortCriteria) // ✅ Correct way to apply sorting
                .skip(skip)
                .limit(limit);



            //console.log(jobPosts,"...............136","........................",userId)


            if (userId) {
                let bookmarks = await bookmarkModel.find({ createdBy: userId, type: 'job' }).select('jobId -_id status');
                console.log(bookmarks, "...............uuuu")
                const bookmarkedJobIds = bookmarks
                    .filter(bookmark => bookmark.status)
                    .map(bookmark => bookmark.jobId.toString());

                jobPosts = jobPosts.map((job) => ({
                    ...job.toObject(),
                    isBookmarked: bookmarkedJobIds.includes(job._id.toString()),
                }));
            }


            if (distanceRange) {
                console.log(distanceRange, "..............224")
                function getJobsWithinDistance(userLat, userLng, jobs, maxDistanceKm) {
                    const EARTH_RADIUS_KM = 6371; // Radius of Earth in km
                    console.log(userLat, "userLat")
                    console.log(userLng, "userLng")
                    console.log(jobs, "jobs")
                    console.log(maxDistanceKm, "maxDistance")
                    // Haversine formula
                    function calculateDistance(lat1, lng1, lat2, lng2) {
                        console.log(lat1, "lat1")
                        console.log(lng1, "lng1")
                        console.log(lat2, "lat2")
                        console.log(lng2, "lat2")
                        const toRad = (value) => (value * Math.PI) / 180;

                        const dLat = toRad(lat2 - lat1);
                        const dLng = toRad(lng2 - lng1);

                        const a =
                            Math.sin(dLat / 2) ** 2 +
                            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                            Math.sin(dLng / 2) ** 2;

                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                        return EARTH_RADIUS_KM * c;
                    }

                    // Filter jobs based on distance
                    return jobs.filter((job) => {
                        const distance = calculateDistance(userLat, userLng, job.jobDetails.latitude, job.jobDetails.longitude);
                        return distance <= maxDistanceKm;
                    });
                }

                jobPosts = getJobsWithinDistance(distanceRange.lat, distanceRange.lng, jobPosts, distanceRange.range);

            }


            // console.log(jobPosts,"...............149")

            const totalJobs = await JobPost.countDocuments(filters);

            res.status(200).json({ success: true, total: totalJobs, data: jobPosts });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error retrieving job posts', error: error.message });
        }
    },


    // Get a single job post by ID
    getJobPostById: async (req, res) => {
        try {
            const { userId, role } = req.user;
            const { id } = req.params;
            const jobPost = await JobPost.findById(id);
            if (!jobPost) {
                return res.status(400).json({ success: false, message: 'Job post not found' });
            }
            let applyStatus = false;
            if (role === 'employee') {
                const checkApply = await applyJobModel.findOne({ jobId: id, userId: userId });
                if (checkApply) {
                    applyStatus = true
                }
            }
            res.status(200).json({ success: true, data: jobPost, applyStatus: applyStatus });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error retrieving job post', error: error.message });
        }
    },


    // Get  job post by employer ID
    getJobPostByEmployerId: async (req, res) => {
        try {
            const { require } = req.query;
            let jobPost = await JobPost.find({ createdBy: req.user.userId }), categories = null;

            if (require === 'all') {
                jobPost = await JobPost.find({ createdBy: req.user.role === 'employer' ? req.user.userId : req.query.employerId });
            }
            else if (require === 'active') {
                //  let currentDate=new Date().toLocaleString().substring(0,10)
                const currentDate = new Date().toISOString().split('T')[0];

                jobPost = await JobPost.find({
                    createdBy: req.user.userId,
                    "workSchedule.startDate": { $gt: currentDate }
                });
            }
            else if (require === 'category') {
                const currentDate = new Date().toISOString().split('T')[0];

                jobPost = await JobPost.find({
                    createdBy: req.user.userId,
                    "workSchedule.startDate": { $gt: currentDate }
                });
                console.log(jobPost[0])
                console.log(".......326")
                categories = jobPost.map((item) => ({
                    id: item._id,
                    categoryName: item.jobDetails.jobCategory,
                    createdAt: item.createdAt
                }));

            }



            if (!jobPost) {
                return res.status(400).json({ success: false, message: 'Job post not found' });
            }
            res.status(200).json({ success: true, data: jobPost, categories: categories });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error retrieving job post', error: error.message });
        }
    },

    // Update a job post by ID
    updateJobPost: async (req, res) => {
        try {
            const { id } = req.params;
            const updatedJobPost = await JobPost.findByIdAndUpdate(id, req.body, { new: true });
            if (!updatedJobPost) {
                return res.status(400).json({ success: false, message: 'Job post not found' });
            }
            res.status(200).json({ success: true, message: 'Job post updated successfully', data: updatedJobPost });
        } catch (error) {
            res.status(400).json({ success: false, message: 'Error updating job post', error: error.message });
        }
    },

    // Delete a job post by ID
    deleteJobPost: async (req, res) => {
        try {
            const { userId, role } = req.user;
            const { id } = req.params;
            //delete jobPost only which is created by the employer


            let deletedJobPost;
            if (role === 'admin') {
                deletedJobPost = await JobPost.findByIdAndDelete(id);
            }

            else if (role === 'employer') {
                deletedJobPost = await JobPost.findOneAndDelete({
                    createdBy: userId, _id: id
                });
            }

            if (!deletedJobPost) {
                return res.status(400).json({ success: false, message: 'Job post not found' });
            }
            res.status(200).json({ success: true, message: 'Job post deleted successfully', data: deletedJobPost });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error deleting job post', error: error.message });
        }
    },

    // Generate 50 sample job posts
    generateJobPosts: (userId) => {
        console.log("generateeeee>>>>")
        const jobTitles = [
            "Software Developer",
            "Frontend Engineer",
            "Backend Developer",
            "Full-Stack Developer",
            "Data Scientist",
            "Cybersecurity Analyst",
            "Mobile App Developer",
            "UI/UX Designer",
            "DevOps Engineer",
            "Cloud Architect"
        ];

        const jobCategories = ["Technical Security", "Web Development", "Data Analytics", "Networking"];
        const employmentTypes = ["Full-Time", "Part-Time", "Contract", "Internship"];

        const jobPosts = [];

        for (let i = 0; i < 50; i++) {
            const jobPost = {
                companyDetails: {
                    companyName: faker.company.name(),
                    companyDescription: faker.company.catchPhrase(),
                    contactEmail: faker.internet.email(),
                    contactNumber: faker.phone.number(),
                    companyWebsite: faker.internet.url(),
                },
                jobDetails: {
                    jobTitle: faker.helpers.arrayElement(jobTitles),
                    jobCategory: faker.helpers.arrayElement(jobCategories),
                    jobDescription: faker.lorem.paragraphs(2),
                    employmentType: faker.helpers.arrayElement(employmentTypes),
                    country: faker.location.country(),
                    state: faker.location.state(),
                    city: faker.location.city(),
                    zipCode: faker.location.zipCode(),
                    applicationDeadline: faker.date.future().toISOString().split('T')[0],
                    salary: {
                        amount: faker.number.int({ min: 40000, max: 120000 }),
                        frequency: "monthly",
                    },
                },
                jobRequirements: {
                    minimumQualification: "Bachelor's Degree in Computer Science",
                    preferredExperience: {
                        minimumExperience: faker.number.int({ min: 0, max: 3 }),
                        maximumExperience: faker.number.int({ min: 4, max: 10 }),
                    },
                    preferredSkills: ["JavaScript", "React", "Node.js", "Python", "AWS"],
                    dressCode: "formal",
                    resume: faker.internet.url(),
                    coverLetter: faker.internet.url(),
                    otherDocument: [
                        {
                            title: "Portfolio",
                            documentType: "Work Samples",
                            url: faker.internet.url(),
                        },
                    ],
                },
                workSchedule: {
                    startTime: "09:00",
                    endTime: "17:00",
                    startDate: faker.date.future().toISOString().split('T')[0],
                    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    duration: 8,
                },
            };
            jobPost.createdBy = userId
            jobPosts.push(jobPost);
        }

        return jobPosts;
    },

    // Save job data to the database
    saveJobData: async (jobPosts, userId) => {
        for (const jobPost of jobPosts) {
            try {
                const savedJob = await JobPost.create(jobPost);
                await Dashboard.findOneAndUpdate(
                    { userId }, // Find the document with the specific userId
                    { $inc: { jobCreated: 1 } }, // Increment the jobCreated field by 1
                    { new: true } // Return the updated document
                );
                console.log(`Job posted successfully:`, savedJob._id);
            } catch (error) {
                console.error(`Error saving job:`, error.message);
            }
        }
    },

    //add the invitedCandidates to postjob model
    addInvitedCandidates: async (req, res) => {
        try {
            //console.log(req.body,"..........req-body");
            const user = await User.findOne({ userId: req.body.userId });
            console.log(user, "user")
            const jobupdate = await postJobModels.findOneAndUpdate(
                {
                    'jobDetails.jobCategory': req.body.category,
                    'invitedCandidates': { $not: { $elemMatch: { userId: req.body.userId } } }


                },
                {
                    $push: {
                        invitedCandidates: {
                            userId: user.userId,
                            name: user.name,
                            email: user.email,
                            contact: user.phoneNumber,
                            profession: 'abcde'
                        }
                    }
                },
                { new: true }

            )
            if (!jobupdate) {
                return res.status(400).json({ success: false, message: "cannot invite this candidate.Invitation already sent" })
            }
            await jobupdate.save();

            let notification = {
                title: "you have a new job invite",
                body: `click the link and check.`,
                link: `${process.env.CLIENT_URL}/applyingjob/${jobupdate._id}`,
                type: "new job invite",
                isRead: false,
            };

            await sendNotificationsToUsers([req.body.userId], notification);
            await updateDashboard(req.body.userId, "invite");
            await updateDashboard(req.user.userId, "invite");

            return res.status(200).json({ success: true, message: "invitation sent to candidate" })


        } catch (err) {
            return res.status(400).json({ success: false, message: err.message })

        }
    },



    //get invites for a particular candidate and employer
    getJobInvitations: async (req, res) => {
        try {
            //console.log("reached")
            const user = await User.findOne({ userId: req.user.userId });

            //console.log(user,"..................531");

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            let invitations = [];

            if (user.role === "employee") {
                // ✅ Get all job posts where user was invited
                invitations = await postJobModels.find({
                    invitedCandidates: {
                        $elemMatch: {
                            userId: req.user.userId,
                        },
                    },
                }).select('jobDetails.jobTitle jobDetails.jobAddress _id');
            } else if (user.role === "employer") {
                // ✅ Get all job posts created by this employer with invited candidates

                const invitationsRaw = await postJobModels.find({
                    createdBy: req.user.userId,
                    invitedCandidates: { $exists: true, $ne: [] },
                })
                    .select('jobDetails.jobCategory invitedCandidates')
                    .lean();
                console.log(invitationsRaw, "invitationsRaw");
                invitations = invitationsRaw.flatMap(job =>
                    job.invitedCandidates.map(candidate => ({
                        id: candidate._id,  // or candidate.id if that's the format
                        name: candidate.name,
                        email: candidate.email,
                        profession: candidate.profession,
                        jobCategory: job.jobDetails?.jobCategory || null,
                    }))
                );
            } else {
                return res.status(400).json({ success: false, message: "Invalid user role" });
            }

            return res.status(200).json({ success: true, invitations });

        } catch (err) {
            return res.status(400).json({ success: false, message: "internal server error" });
        }
    }




};

module.exports = jobPostController;
