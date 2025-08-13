const mongoose = require('mongoose');

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const JobCategory = [
    'Security and Protection',
    'Technical Security',
    'Emergency Response and Health',
    'Law and Enforcement',
    'Transportation Security',
    'Facility and Property Management',
    'Specialized Services',
    'Training and Consultancy',
    'General Labor and Support',
    'Freelance and Temporary Jobs',
    'Other'
];

const employmentChoice = [
    "Full-Time",
    "Part-Time",
    "Contract",
    "Temporary",
    "Freelance",
    "On-Call",
    "Shift-Based",
    "Internship",
    "Apprenticeship",
    "Remote Work",
    "Hybrid",
    "Volunteer",
    "Per-Day"
];

const companyDetailsSchema = mongoose.Schema({
    companyName: { type: String },
    employerName: { type: String },
    companyDescription: { type: String },
    contactEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return emailRegex.test(v);
            },
            message: (props) => `${props.value} is not a valid email address!`,
        },
    },
    contactNumber: { type: String, required: true }, // Use String to support country codes
    companyWebsite: {
        type: String,
        // validate: {
        //     validator: function (v) {
        //         return /^(ftp|http|https):\/\/[^ "]+$/.test(v); // URL validation regex
        //     },
        //     message: (props) => `${props.value} is not a valid URL!`,
        // },
    },
    companyLogo:{
        type:String,  
    }
});

const jobDetailsSchema = mongoose.Schema({
    jobTitle: { type: String, required: true },
    jobCategory: {
        type: String,
        // enum: JobCategory,
        required: true,
    },
    jobDescription: { type: String, required: true },
    employmentType: {
        type: String,
        // enum: employmentChoice,
        required: true,
    },
    country: { type: String ,default:"uk"},
    state: { type: String },
    city: { type: String, required: true },
    zipCode: { type: String, required: true }, // Use String for alphanumeric codes
    applicationDeadline: { type: String, required: true },
    salary: {
        amount: { type: Number, required: true },
        frequency: {
            type: String,
            // enum: ["daily", "weekly", "monthly"],
            required: true,
        },
    },
    jobAddress:{ type: String, required: true},
    latitude:{ type: Number, required: true},
    longitude:{ type: Number, required: true},
});

const jobRequirementSchema = mongoose.Schema({
    minimumQualification: { type: String },
    minimumExp: { type: Number, default: 0 },
    maximumExp: { type: Number, default: 0 }, // Changed key to lowercase for consistency
    jobSkills: { type: [String], required: true }, // Array of strings for skills
    dressCode: { type: String, required: true, default: "casual" },
    resume: { type: String },
    coverLetter: { type: String },
    otherDocument: {
        type: [
            {
                title: { type: String, },
                documentType: { type: String, },
            },
        ],
    },
});





const workScheduleSchema = mongoose.Schema({
    startTime: { type: String, required: true }, // Use String to support only time (e.g., HH:mm)
    endTime: { type: String, required: true },
    startDate: { type: Date },
    workingDays: { type: [String] }, // Array of days (e.g., ["Monday", "Tuesday"])
    duration: { type: Number }, // In hours or days
});


const invitedCandidatesSchema = mongoose.Schema({
    userId: { type: String,  }, // Use String to support only time (e.g., HH:mm)
    name: { type: String,},
    email: { type: String },
    contact: { type: String }, // Array of days (e.g., ["Monday", "Tuesday"])
    profession: { type: String }, // In hours or days
    //jobId:{type:mongoose.Schema.Types.ObjectId,ref:''}
});

const jobPostSchema = mongoose.Schema({
    createdBy:{type:String, ref:'User',required:true},
    //employerName:{type:String, ref:'User', required:true},
    companyDetails: { type: companyDetailsSchema },
    jobDetails: { type: jobDetailsSchema },
    jobRequirements: { type: jobRequirementSchema },
    workSchedule: { type: workScheduleSchema },
    invitedCandidates:{type:[invitedCandidatesSchema]},
    featured:{type:Boolean,default:false},
    status:{type:String,enum:['active','completed']},
    createdOn: {
        type: String,
        default: function () {
          return new Date().toISOString().split('T')[0]; // Store "YYYY-MM-DD" format
        }
      }
      
    
},
{
    timestamps:true
},




);

//indexing
//Employer Name
jobPostSchema.index({ employerName: 1 });
// Empolyer Id
jobPostSchema.index({ createdBy: 1 });
// job title
jobPostSchema.index({"jobDetails.jobTitle": 1})
//Experience
// jobDetailsSchema.index({"jobRequirements."})
//company
jobPostSchema.index({"companyDetails.companyName":1});
//country
jobPostSchema.index({"jobDetails.country":1});
//city
jobPostSchema.index({"jobDetails.city":1});
//state
jobPostSchema.index({"jobDetails.state":1});
//category
jobPostSchema.index({"jobDetails.jobCategory":1});

module.exports = mongoose.model('JobPost', jobPostSchema);
