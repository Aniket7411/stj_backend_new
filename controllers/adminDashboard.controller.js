const JobPost = require('../models/postJob.models');
const Course = require('../models/course.models');
const User = require('../models/user.model');
const Category = require('../models/category.model');
const jwt = require('jsonwebtoken');
const emailVerification = require('../helpers/otpverification');
exports.getDashboard = async (req, res) => {
    try {
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Count jobs for the current month
        const currentMonthJobs = await JobPost.countDocuments({
            createdAt: { $gte: startOfCurrentMonth }
        });

        // Count jobs for the previous month
        const previousMonthJobs = await JobPost.countDocuments({
            createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth }
        });

        // Calculate percentage increase or decrease
        let percentageChange = 0;
        if (previousMonthJobs > 0) {
            percentageChange = ((currentMonthJobs - previousMonthJobs) / previousMonthJobs) * 100;
        } else if (currentMonthJobs > 0) {
            percentageChange = 100; // 100% increase if no jobs in the previous month
        }

        // Count active job postings where jobDetails.applicationDeadline >= current date
        const activeJobPosts = await JobPost.countDocuments({
            "jobDetails.applicationDeadline": { $gte: now }
        });

        // Get users and employers counts
        const activeUsers = await User.countDocuments({ role: 'employee' });
        const activeEmployers = await User.countDocuments({ role: 'employer' });

        // Total courses count
        const totalCourses = await Course.countDocuments();

        // Active courses: start date is passed but end date is not
        const activeCourses = await Course.countDocuments({
            "courseDetails.startDate": { $lte: now },
            "courseDetails.endDate": { $gte: now }
        });

        // Upcoming courses: start date is not passed
        const upcomingCourses = await Course.countDocuments({
            "courseDetails.startDate": { $gt: now }
        });

        // Completed courses: end date is passed
        const completedCourses = await Course.countDocuments({
            "courseDetails.endDate": { $lt: now }
        });

        // Course count by categories
        const coursesByCategory = await Course.aggregate([
            {
                $group: {
                    _id: "$courseDetails.category",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 } // Optional: Sort categories by count in descending order
            }
        ]);

        return res.status(200).json({
            Error: false,
            message: "Dashboard data fetched successfully",
            data: {
                currentMonthJobs,
                percentageChange: percentageChange.toFixed(2), // Rounded to 2 decimal places
                activeJobPosts, // Active job postings count
                activeUsers,
                activeEmployers,
                totalCourses,
                activeCourses,
                upcomingCourses,
                completedCourses,
                coursesByCategory
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ Error: true, message: "Internal server error" });
    }
};

//course management
exports.addCategory = async (req, res) => {
    try {
        const { name, icon } = req.body;
        const category = await Category.findOne({ name });
        if (category) {
            return res.status(400).json({ message: "category with this name already exist" });
        }
        const newCategory = await Category.create({ name, icon });
        return res.status(201).json({ message: "Category added", category: newCategory });
        // console.log(newCategory)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.getCategory = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.status(200).json({ categories });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.getCourseManagement = async (req, res) => {
    try {
        const { status = "pending" } = req.query;
        console.log(status);
        const verified = (status === "pending") ? null : (status === 'true') ? true : false
        console.log(verified);

        const courses = await Course.find({ verified });
        return res.status(200).json({ courses });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.coursePusblishRequest = async (req, res) => {
    try {
        const { courseId, status } = req.body;
        const course = await Course.findOneAndUpdate({ _id: courseId }, { verified: status });
        if (!course) {
            return res.status(400).json({ error: true, message: "course not found" });
        }
        return res.status(200).json({ success: true, message: "course approved", course });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

//admin management
exports.getAdminManagement = async (req, res) => {
    try {
        const users = await User.find({ role: "admin" });
        return res.status(200).json({ users });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.addAdminManagement = async (req, res) => {
    try {
        const { name, email, password, phoneNumber } = req.body;
        const existingUser = await User.findOne({ email:email });

        if ( existingUser) {
            return res.status(400).json({ message: "mail already exist" });
        }
        const user = new User({
            name,
            email,
            password,
            phoneNumber,
            role:"admin"
        });
        await user.save();
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', {
            expiresIn: "1h",
        });

        // Create verification link
        const verificationLink = `${process.env.CLIENT_URL}/verifyEmail?token=${token}`;

        // Email content
        const emailContent = `
            <h2>Welcome to Our Service</h2>
            <p>Click the link below to verify your email:</p>
            <a href="${verificationLink}">Verify Email</a>
        `;



        // Send verification email
        await emailVerification(email, "Verify Your Email", emailContent);

        return res.status(200).json({ message: "admin added", user:user });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
}

exports.deleteAdmin = async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOneAndDelete({ email, role: "admin" });
        if (!user) {
            return res.status(400).json({ error: true, message: "Admin not found" });
        }
        return res.status(200).json({ success: true, message: "admin deleted successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error" });
    }
}


//Employer management in admin
exports.getEmployersList=async(req,res)=>{
    //username,email,phoneNumber,status,activity
    try{
        if(req.user.role!='admin'){
            return res.status(400).send({
                message:"you are not authorized"
            })
        }
        const userList=await User.find({role:"employer"});
    if(!userList){
        return res.status(400).send({
            message:"there are no employers yet"
        })
    }

    return res.status(200).send({
        employers:userList,      
    })

    }catch(err){
        return res.status(400).send({
            message:err.message
        })
    }
}



exports.getEmployerCourses=async(req,res)=>{
    //send employerId in payload
    try{
        const courseList=await Course.find({role:"employer"});
    if(!userList){
        return res.status(400).send({
            message:"there are no employers yet"
        })
    }

    return res.status(200).send({
        employers:userList,      
    })

    }catch(err){
        return res.status(400).send({
            message:err.message
        })
    }
}


//can take from job post as well
// exports.getEmployerJobPost=async(req,res)=>{
//     //send employerId in payload
    
//     try{
//         const {employerId}=req.query
//         const jobposts=await JobPost.find({createdBy:employerId});
       
//     if(!jobposts){
//         return res.status(400).send({
//             message:"there are no job post for this employer yet"
//         })
//     }

//     return res.status(200).send({
//         jobposts:jobposts,      
//     })

//     }catch(err){
//         return res.status(400).send({
//             message:err.message
//         })
//     }
// }








//Employer management in admin
exports.getEmployersList=async(req,res)=>{
    //username,email,phoneNumber,status,activity
    try{
        if(req.user.role!='admin'){
            return res.status(400).send({
                message:"you are not authorized"
            })
        }
        const userList=await User.find({role:"employer"});
    if(!userList){
        return res.status(400).send({
            message:"there are no employers yet"
        })
    }

    return res.status(200).send({
        employers:userList,      
    })

    }catch(err){
        return res.status(400).send({
            message:err.message
        })
    }
}



exports.getEmployerCourses=async(req,res)=>{
    //send employerId in payload
    try{
        const courseList=await Course.find({role:"employer"});
    if(!userList){
        return res.status(400).send({
            message:"there are no employers yet"
        })
    }

    return res.status(200).send({
        employers:userList,      
    })

    }catch(err){
        return res.status(400).send({
            message:err.message
        })
    }
}


//can take from job post as well
// exports.getEmployerJobPost=async(req,res)=>{
//     //send employerId in payload
    
//     try{
//         const {employerId}=req.query
//         const jobposts=await JobPost.find({createdBy:employerId});
       
//     if(!jobposts){
//         return res.status(400).send({
//             message:"there are no job post for this employer yet"
//         })
//     }

//     return res.status(200).send({
//         jobposts:jobposts,      
//     })

//     }catch(err){
//         return res.status(400).send({
//             message:err.message
//         })
//     }
// }







//job management
exports.jobMangement = async (req, res) => {
    //get job id, job name job category, employer name, location, start date, duration, job pay, status
    try {
        const jobs = await JobPost.find();
        const response = [];

        for (let i = 0; i < jobs.length; i++) {
            const job = {};
            job.jobId = jobs[i]._id;
            job.name = jobs[i].jobDetails.jobTitle;
            job.category = jobs[i].jobDetails.jobCategory;
            job.employer = jobs[i].employerName;
            job.company = jobs[i].companyDetails.companyName
            job.pay = jobs[i].jobDetails.salary.amount;
            job.location = `${jobs[i].jobDetails.city}, ${jobs[i].jobDetails.state}, ${jobs[i].jobDetails.country}`;
            job.duration = jobs[i].workSchedule.duration;
            job.status = jobs[i].workSchedule.startDate > Date.now() ? "active" : "inactive";
            response.push(job);
        }

        console.log(response[0]);
        return res.status(200).json({ message: "jobs data", response });

        // console.log(jobs);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

//user management
exports.userManagement = async(req, res)=>{
    try {
        const users = await User.find();
        const response = [];

        for(let i=0; i<users.length;i++){
            const user={};
            if(users[i].role==='admin'){
                continue;
            }
            user._id=users[i]._id;
            user.name= users[i].name;
            user.email = users[i].email;
            user.userId = users[i].userId;
            user.phoneNumber=users[i].phoneNumber;
            user.verify = users[i].isVerified===true?"verified":"unverfied";
            user.userType = users[i].role;
            user.status=users[i].status;
            user.workPermit=users[i].profile.generalInformation.workPermit;
            response.push(user);
            
        }
        return res.status(200).json({success:true, response});
    } catch (error) {
        return res.status(500).json({error:true, message:"Internal server Error"});
    }
}



//delete a particular user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(400).json({ error: true, message: "User not found" });
        }
        return res.status(200).json({ success: true, message: "user deleted successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error" });
    }
}




//update user.
exports.editActiveUser = async (req, res) => {
    try {
        const { userId, status } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { status: status === 'active' ? 'active' : 'inactive' } },
            { new: true } // Returns the updated document
        );

        await user.save();

        if (!user) {
            return res.status(400).json({ error: true, message: "User not found" });
        }

        return res.status(200).json({ success: true, message: "User updated successfully", user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error" });
    }
};






//update user.
exports.editVerificationUser = async (req, res) => {
    try {
        const { userId,status} = req.params;

        console.log(req.params,"...........................493")

        const user = await User.findOneAndUpdate(
            {userId:userId},
            { $set: {isVerified:status==='true'?true:false} },
            { new: true } // Returns the updated document
        );

        await user.save();

        if (!user) {
            return res.status(400).json({ error: true, message: "User not found" });
        }

        return res.status(200).json({ success: true, message: "User updated successfully", user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Internal server error" });
    }
};
