const emailVerification = require('../helpers/otpverification');
const User = require('../models/user.model');
const bcrypt = require('bcrypt'); // Ensure bcrypt is required here
const jwt = require('jsonwebtoken');
const { createToken, refToken, verifyToken, } = require('../token/userToken');
const { createDashboard } = require('../controllers/dashboard.controller');
const Dashboard = require('../models/dashBoard.models');
const favcandidateModel = require('../models/favcandidate.model');
const postJobModels = require('../models/postJob.models');
// Register User
const registerUser = async (req, res) => {
    const { name, email, password, phoneNumber, role, companyName } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        // Create a new user with initialized profile sections
        const user = new User({
            name,
            email,
            password,
            phoneNumber,
            profile: {
                personalInformation: {
                    email,
                    contactNumber: phoneNumber,
                    password, // This is for initialization; ensure it's hashed securely
                },
                generalInformation: {

                }, // Initialized empty
                uploads: {}, // Initialized empty


            },
            role,
            companyName
        });
        //console.log(">>>>", user);
        //console.log(">>>>");
        await user.save();
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', {
            expiresIn: "1h",
        });
        console.log("tokennnn", token)

        // Create verification link
        const verificationLink = `${process.env.CLIENT_URL}/verifyEmail?token=${token}`;
        console.log("verificationLink", verificationLink)

        // Email content
        const emailContent = `
           <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9;">
  <table
    align="center"
    border="0"
    cellpadding="0"
    cellspacing="0"
    width="600"
    style="border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);"
  >
    <tr>
      <td style="padding: 20px; background-color: #011f4b; color: #ffffff; text-align: center;">
        <h1>Verify Your Email Address</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: left;">
        <p>Dear ${user.name},</p>
        <p>Welcome to Secure That Job! Please verify your email address by clicking the button below:</p>
        <p style="text-align: center; margin: 20px 0;">
          <a
            href="${verificationLink}"
            style="text-decoration: none; background-color: #28a745; color: #ffffff; padding: 10px 20px; border-radius: 5px; font-size: 16px;"
            >Verify Email</a
          >
        </p>
        <p>If you did not sign up for an account, please disregard this email.</p>
        <p>Thank you,<br />SecureThatJob Team</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 10px; background-color: #f2f2f2; text-align: center; font-size: 12px; color: #666;">
        If you’re having trouble clicking the button, copy and paste the following link into your browser: ${verificationLink}
      </td>
    </tr>
  </table>
</body>
</html>
        `;



        // Send verification email
        await emailVerification(email, "Verify Your Email", emailContent);

        await createDashboard({ role, userId: user.userId, profileCompleted: user.profile.profileCompletion, credits: 20 });

        // console.log(user);
        return res.status(201).json({ success: true, message: "Registration Successful" });
    } catch (error) {
        console.error("Internal Server Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// app.get"/verify-email",

const verifyMail = async (req, res) => {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await User.findByIdAndUpdate(decoded.userId, { isVerified: true });
        res.status(200).send({ message: "Email Verified Successfully!", success: true });
    } catch (error) {
        res.status(400).send("Invalid or Expired Token");
    }
};


//updating user role


// Log In User
const logIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "User not registered with this email",
                });
        }

        // Verify password using comparePassword method
        // const passwordMatch = await user.comparePassword(password);
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }
        if (!user.isVerified) {
            return res.status(400).json({
                message: "User not verfied",
            });
        }
        // if (user.status==='inactive') {
        //     return res.status(400).json({
        //       message: "your account is not active. Kindly contact the admin",
        //     });
        //   }
        const token = createToken(user);
        const refreshtoken = refToken(user);

        // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        //   expiresIn: "1h",
        // });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            userData: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user?.role,

                //  authToken: token,
            },
            accessToken: token,
            refreshToken: refreshtoken,
        });
    } catch (error) {
        console.error("Error in Login:", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
    }
};


//send otp to user for mail verification for password reset
const sendVerifyMail = async (req, res) => {
    try {
        const { email } = req.body;
        const checkmail = await User.findOne({ email: email });
        if (!checkmail) {
            return res.status(400).send({
                message: 'email does not exist'
            })
        }
        // const randomFourDigit = Math.floor(1000 + Math.random() * 9000);
        const token = createToken(checkmail);

        //checkmail.otp=randomFourDigit
        const emailContent = `
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Recovery</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9;">
  <table
    align="center"
    border="0"
    cellpadding="0"
    cellspacing="0"
    width="600"
    style="border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);"
  >
    <tr>
      <td style="padding: 20px; background-color: #011f4b; color: #ffffff; text-align: center;">
        <h1>Password Recovery</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: left;">
        <p>Dear ${checkmail.name},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <p style="text-align: center; margin: 20px 0;">
          <a
            href="${process.env.CLIENT_URL}/resetPassword/${token}"
            style="text-decoration: none; background-color: #007bff; color: #ffffff; padding: 10px 20px; border-radius: 5px; font-size: 16px;"
            >Reset Password</a
          >
        </p>
        <p>If you did not request a password reset, please ignore this email or contact our support team.</p>
        <p>Thank you,<br />Secure That Job Team</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 10px; background-color: #f2f2f2; text-align: center; font-size: 12px; color: #666;">
        If you’re having trouble clicking the button, copy and paste the following link into your browser:${process.env.CLIENT_URL}/resetPassword/${token}
      </td>
    </tr>
  </table>
</body>
</html>
    `;
        //await checkmail.save();
        await emailVerification(email, 'Verification code for password reset', emailContent);

        return res.status(200).send({
            message: 'a link is sent to your email to change password',
            success: true
        })

    } catch (err) {
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });

    }
}

//verify otp to authorize the user
const verifyAndChangePassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const checkToken = verifyToken(token);
        const salt = await bcrypt.genSalt(10);

        const verifyUser = await User.findOneAndUpdate({ email: checkToken.email }, {
            $set: {
                password: await bcrypt.hash(newPassword, salt)
            }
        });

        await verifyUser.save();
        if (!verifyUser) {
            return res.status(400).send({
                message: 'otp not sent or invalid'
            })
        }
        // const randomFourDigit = Math.floor(1000 + Math.random() * 9000);
        //checkmail.otp=randomFourDigit
        //     const emailContent = `
        //     <h2>Welcome to Our Service</h2>
        //     <p>Your otp for password reset verification is:</p>
        //     <p>${randomFourDigit}</p>
        // `;


        return res.status(200).send({
            success: true,
            message: 'email verified and password updated'
        })

        //await checkmail.save();
        //await emailVerification(email,'Verification code for password reset',emailContent)

    } catch (err) {
        return res
            .status(500)
            .json({ success: false, message: err.message });

    }
}

//finally change the password
const changePassword = async (req, res) => {
    try {

        console.log("......319");
        const { oldPassword, newPassword } = req.body;


        //check if oldPassword is correct/
        const { userId } = req.user;

        console.log(userId, ".......326")

        const user = await User.findOne({ userId: userId });


        console.log(user, ".......331")

        if (!user) {
            return res.status(400).send({
                success: false,
                message: "user not found"
            })
        }

        const passwordMatch = await bcrypt.compare(oldPassword, user.password);

        console.log(passwordMatch, ".......326")
        if (!passwordMatch) {
            return res.status(401).json({ message: "Incorrect old password" });
        }
        const salt = await bcrypt.genSalt(10);
        const updatePassword = await User.findOneAndUpdate({ userId: userId }, {
            $set: {
                password: await bcrypt.hash(newPassword, salt)
            }
        })

        if (!updatePassword) {
            return res.status(400).send({
                message: 'internel server error'
            })
        }

        await updatePassword.save();

        return res.status(200).send({
            message: 'password updated successfully',
            success: true
        })




    } catch (err) {
        return res.status(500).send({ message: err.message })

    }
}


//logout
const logOut = async (req, res) => {
    try {
        const header = req.headers.authorization;
        const accessToken = header.split(" ")[1];
        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted
        // if true, send a no content response.
        if (checkIfBlacklisted) return res.sendStatus(204);
        // otherwise blacklist token
        const newBlacklist = new Blacklist({
            token: accessToken,
        });
        await newBlacklist.save();
        // Also clear request cookie on client
        res.setHeader("Clear-Site-Data", '"cookies"');
        return res.status(200).json({ message: "Logout Successfully!" });
    } catch (error) {
        console.error("Error in Logout :", error);
        return res.status(500).json({
            status: "error",
            error,
            message: "Internal Server Error",
        });
    }
};


const updatePersonalInformation = async (req, res) => {
    const { userId, role } = req.user;
    const personalInformationData = req.body;
    console.log(req.body, "........................................................................................................................................................................................................................313");

    try {

        let user = {};
        console.log(personalInformationData, "............................413");

        if (role === 'employee') {
            user = await User.findOneAndUpdate(
                { userId },
                {
                    $set: {
                        "profile.personalInformation": personalInformationData.personalInformation,
                        "profile.generalInformation": personalInformationData.generalInformation,
                    }
                },
                { new: true, runValidators: true }
            );
        }

        else if (role === 'employer') {
            user = await User.findOneAndUpdate(
                { userId },
                {
                    $set: {
                        "profile.personalInformation.contactNumber": personalInformationData.personalInformation.contactNumber,
                        "profile.personalInformation.paypalEmail": personalInformationData.personalInformation.paypalEmail,
                        "profile.personalInformation.dob": personalInformationData.personalInformation.dob,
                        "profile.personalInformation.gender": personalInformationData.personalInformation.gender,
                        "profile.personalInformation.nationality": personalInformationData.personalInformation.nationality,
                        "profile.personalInformation.address": personalInformationData.personalInformation.address,
                        "profile.personalInformation.profileImage": personalInformationData.personalInformation.profileImage,
                        "profile.personalInformation.coverImage": personalInformationData.personalInformation.coverImage,
                        "profile.generalInformation.height": personalInformationData.generalInformation.height,
                        // "profile.personalInformation.profileImage":personalInformationData.generalInformation.profileImage,
                        // "profile.generalInformation.ailments":personalInformationData.generalInformation.ailments,
                        "profile.generalInformation.utrNumber": personalInformationData.generalInformation.utrNumber,
                        //"profile.generalInformation.postCode":personalInformationData.generalInformation.postCode,
                        "profile.personalInformation.referralCode": personalInformationData.personalInformation.referralCode,
                        "profile.personalInformation.profession": personalInformationData.personalInformation.profession,
                    }
                },
                { new: true, runValidators: true }
            );
        }




        // else if(role==='employer'){
        //     user = await User.findOneAndUpdate(
        //         { userId },
        //         { "profile.personalInformation": personalInformationData },
        //         { new: true, runValidators: true } // Returns the updated document
        //     );

        // }



        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        //await user.s
        await Dashboard.findOneAndUpdate({ userId }, { profileCompleted: user.profile.profileCompletion });
        return res.status(200).json({
            success: true,
            message: "Personal information updated successfully",
            profile: user.profile.personalInformaiton
        });
    } catch (error) {
        console.error("Error updating personal information:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


const updateGeneralInformation = async (req, res) => {
    const { userId } = req.user;
    const generalInformationData = req.body;
    console.log(userId);
    try {
        const user = await User.findOneAndUpdate(
            { userId },
            {
                "profile.generalInformation": generalInformationData,
            },
            // { new: true, runValidators: true }
            { new: true }
        );

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        await Dashboard.findOneAndUpdate({ userId }, { profileCompleted: user.profile.profileCompletion });
        return res.status(200).json({
            success: true,
            message: "General information updated successfully",
            profileCompletion: user.profile.profileCompletion,
            profile: user.profile.generalInformation
        });
    } catch (error) {
        console.error("Error updating general information:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


const updateUploads = async (req, res) => {
    const { userId } = req.user;
    const uploadsData = req.body;

    try {
        const user = await User.findOneAndUpdate(
            { userId },
            { "profile.uploads": uploadsData },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        await Dashboard.findOneAndUpdate({ userId }, { profileCompleted: user.profile.profileCompletion });
        return res.status(200).json({
            success: true,
            message: "Uploads updated successfully",
            profile: user.profile.uploads
        });
    } catch (error) {
        console.error("Error updating uploads:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getProfile = async (req, res) => {
    const { userId } = req.query;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ Error: true, message: "user not found!" });
        }
        user.email = 'XXXX@gmail.com';
        user.phoneNumber = 7299999999999
        user.name = 'XXXX YYYY';
        return res.status(200).json({ Success: true, user });
    } catch (error) {
        return res.status(500).json({ Error: true, message: "Internal Server Error" });
    }
}

const getMyProfile = async (req, res) => {
    const { userId } = req.user;
    // console.log(">>>",req.user);
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(400).json({ message: "User Not found" });
        }
        //calulate the mapData over here and find jobs whose latitude and longitude are in range of user drop-down
        // user.latitde and user.longitude exist,
        //find those jobs whose latitude and longitude are within the range of value decided by the user.
        let userLat = user.profile.personalInformation.address.latitude;
        let userLng = user.profile.personalInformation.address.longitude;
        let distanceRange = 1000;
        let nearbyJobs = [];
        if (userLat && userLng) {

            let jobs = req.user.role === 'employee' ? await postJobModels.find() : await User.find({ role: 'employee' });
            function getJobsWithinDistance(userLat, userLng, jobs, maxDistanceKm) {
                const EARTH_RADIUS_KM = 6371; // Radius of Earth in km
                console.log(userLat, "userLat")
                console.log(userLng, "userLng")
                console.log(jobs, "jobs")
                console.log(maxDistanceKm, "maxDistance")
                // Haversine formula
                function calculateDistance(lat1, lng1, lat2, lng2) {
                    // Check if any coordinate is missing or not a number
                    if (
                        lat1 == null || lng1 == null ||
                        lat2 == null || lng2 == null ||
                        lat1 == undefined || lng1 == undefined ||
                        lat2 == undefined || lng2 == undefined ||
                        isNaN(lat1) || isNaN(lng1) ||
                        isNaN(lat2) || isNaN(lng2)
                    ) {
                        console.log("Missing or invalid coordinates:", { lat1, lng1, lat2, lng2 });
                        return Number.MAX_VALUE; // or return 0 or a fallback value
                    }

                    const EARTH_RADIUS_KM = 6371; // Earth's radius in kilometers
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

                    const distance = req.user.role === 'employee' ?
                        calculateDistance(userLat, userLng, job.jobDetails.latitude, job.jobDetails.longitude)
                        :
                        calculateDistance(
                            userLat,
                            userLng,
                            job.profile.personalInformation.address.latitude || undefined,
                            job.profile.personalInformation.address.longitude || undefined
                        );
                    return distance <= maxDistanceKm;
                });
            }

            nearbyJobs = getJobsWithinDistance(userLat, userLng, jobs, distanceRange);

            if (nearbyJobs && req.user.role === 'employee') {
                nearbyJobs = nearbyJobs.map((item) =>
                (
                    {
                        latitude: item.jobDetails.latitude,
                        longitude: item.jobDetails.longitude,
                        details: {
                            companyName: item.companyDetails.companyName,
                            jobTitle: item.jobDetails.jobTitle,
                        }
                    }
                )
                )

            }
            else if (nearbyJobs && req.user.role === 'employer') {
                nearbyJobs = nearbyJobs.map((item) =>
                (
                    {
                        latitude: item.profile.personalInformation.address.latitude,
                        longitude: item.profile.personalInformation.address.longitude,
                        details: {
                            profession: item.profile.personalInformation.profession || "NA",
                            name: item.name || "NA",
                        }
                    }
                )
                )
            }
            //console.log(jobs, ".................121")
            //console.log("85")
        }
        return res.status(200).json({ user, success: true, nearbyJobs });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}




const getUploadedData = async (req, res) => {
    const { userId } = req.user;
    // console.log(">>>",req.user);
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(400).json({ message: "User Not found" });
        }
        return res.status(200).json({ data: user.profile.uploads, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const search = async (req, res) => {
    const { query, page = 1 } = req.query;

    try {
        const limit = 20; // Number of results per page
        const skip = (page - 1) * limit; // Calculate the number of documents to skip

        // Build a single query object for searching
        const searchQuery = {
            $or: [
                { name: { $regex: query, $options: "i" } }, // Search in `name`
                { "profile.generalInformation.experience.title": { $regex: query, $options: "i" } }, // Search in `title`
                { "profile.generalInformation.experience.company": { $regex: query, $options: "i" } } // Search in `company`
            ]
        };

        // Execute the query with pagination
        const results = await User.find(searchQuery).skip(skip).limit(limit);

        // Check if no results found
        if (results.length === 0) {
            return res.status(400).json({ success: false, message: "No data found" });
        }

        // Get the total count of matching documents
        const totalResults = await User.countDocuments(searchQuery);

        // Return results with pagination metadata
        return res.status(200).json({
            success: true,
            results,
            totalResults,
            currentPage: page,
            totalPages: Math.ceil(totalResults / limit)
        });
    } catch (error) {
        console.error("Error in search function:", error);
        return res.status(500).json({ success: false, message: "Error in search function" });
    }
};


const findCandidate = async (req, res) => {
    try {
        const { page = 1, keyword, category } = req.query;
        console.log(keyword, "...............", req.query, ".......296")

        const limit = 20;
        const skip = limit * (page - 1);

        // Build the filter object
        const filters = {
            role: "employee",
            isVerified: true
        };

        // Apply keyword filter
        if (keyword) {
            filters["$or"] = [
                { "profile.generalInformation.experience.title": { $regex: keyword, $options: "i" } },
                { "profile.generalInformation.experience.company": { $regex: keyword, $options: "i" } },
                { "profile.generalInformation.experience.title": { $regex: category, $options: "i" } },
                { "profile.generalInformation.experience.company": { $regex: category, $options: "i" } },
                { "profile.personalInformation.profession": { $regex: category, $options: "i" } },
            ];

        }

        let user = await User.find(filters).skip(skip).limit(limit).lean();


        const favCandidate = await favcandidateModel.find({ employerId: req.user.userId }).select('candidateId');
        console.log(favCandidate, "........663")


        //name, email , phoneNumber
        user = user.map((item, index) => ({
            ...item,  // Keep existing properties
            email: 'XXXXX@gmail.com',
            phoneNumber: 'XXXXXXXXX',
            name: 'XXXXX',
            favStatus: favCandidate.some(
                (candidate) => candidate.candidateId === item.userId
            )
        }));





        if (!user) {
            return res.status(400).send({
                message: "no candidate found for searched query"
            })
        }
        return res.status(200).send({
            data: user
        })


    } catch (err) {
        return res.status(400).send({
            message: err?.message
        })
    }
}



//




//invite candidate to apply for the job
exports.markAsInvite = async (req, res) => {
    try {
        const { candidateId, category } = req.body;

        const { userId } = req.user;
        // Check if the candidate is already marked as invited
        const existingInvite = await User.findOne({ userId: candidateId, invites: userId });

        if (existingInvite) {
            return res.status(400).json({ success: false, message: "Candidate is already marked as Invite" });
        }

        const jobpost = await postJobModels.findOne({ createdBy: userId, 'jobDetails.jobCategory': category });

        if (!jobpost) {
            return res.status(400).json({ success: false, message: "cannot invite for job if you have not posted it" });
        }

        // Create new favorite entry
        const newInvite = await User.findOneAndUpdate({ userId: candidateId }, {
            $push: {
                invites: userId
            }
        });
        await newInvite.save();
        const employer = await User.findOne({ userId: userId });

        //notify to user if they are marked favourite
        let notification = {
            title: "marked favourite",
            body: `your are invited by employer at ${employer.companyName} for post ${jobpost.jobDetails.jobCategory}  `,
            type: "job status update",
            isRead: false,
        };

        await sendNotificationsToUsers([candidateId], notification);

        return res.status(201).json({ success: true, message: "Candidate marked as favorite.", data: newFavorite });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};



module.exports = {
    registerUser,
    logIn,
    sendVerifyMail,
    verifyAndChangePassword,
    changePassword,
    verifyMail,
    getMyProfile,
    updatePersonalInformation,
    updateGeneralInformation,
    updateUploads,
    getProfile,
    getUploadedData,
    search,
    findCandidate,
    logOut
};
