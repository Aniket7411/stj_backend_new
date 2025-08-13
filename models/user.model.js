const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
// Dynamic import for nanoid
let nanoid;
(async () => {
    const { nanoid: nanoidFn } = await import('nanoid');
    nanoid = nanoidFn;
})();

// Email validation regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const addressSchema = new mongoose.Schema({
    address: { type:String },
    postCode: { type:String },
    country: { type:String,default:"uk" },
    town: { type:String },
    city: { type:String },
    state:{type:String},
    latitude:{type:Number,default:null},
    longitude:{type:Number,default:null},
}, { _id: false });

const personalInformationSchema = new mongoose.Schema({
    contactNumber: { type: String},
    paypalEmail: { type: String },
    dob: { type: String },
    gender: { type: String },
    nationality: { type: String },
    profession:{type:String},
    paypalEmail:{type:String},
    address: { type: addressSchema },
    skills:{type:[String]},
    profileImage:{type:String},
    coverImage:{type:String},
    referralCode:{type:String},
    video:{type:String}
}, { _id: false });

const experienceSchema = new mongoose.Schema({
    title: { type: String,  },
    company: { type: String,  },
    webSite: { type: String },
    location: { type: String,  },
    employment: { type: String,  },
    startDate: { type: Date,  },
    endDate: { type: Date },
    description: { type: String },
    currentlyWorking: { type: Boolean, default: false },
}, { _id: false });

const generalInformationSchema = new mongoose.Schema({
    height: { type: Number },
    build: { type: String, default: "N/A" },
    language: { type: String },
    utrNumber: { type: Number },
    ailments: { type: String, default: "no",enum:["yes","no"] },
    healthIssue: { type: String, default: "N/A" },
    travelWill: { type: Number },
    millitaryBackground: { type: String, enum:["yes","no",""], },
    ukDrivingLicense: { type: String, enum:["yes","no",""], },
    paramedicTraining: { type: String, enum:["yes","no",""], },
    piercing: { type: String, enum:["yes","no",""], },
    abroadTravel: { type: String, enum:["yes","no",""], },
    siaBadge: { type: String, enum:["yes","no",""], },
    drive: { type: String, enum:["yes","no",""], },
    firstAid: { type: String, enum:["yes","no",""], },
    tattoo: { type: String, enum:["yes","no","true","false"], },
    workPermit: { type: String, enum:["yes","no","true","false"], },
    cscs: { type: String, enum:["yes","no",""], },
    passportDrivingLicense: { type: String, enum:["yes","no",""], },
    //utilityBillStatement: { type: Boolean },
    bio: { type: String },
    experience: { type: [experienceSchema] },
}, { _id: false });

const uploadsSchema = new mongoose.Schema({
    educationalCertificate: { type: String },
    drivingLicense: { type: String},
    skillCertificate: { type: String },
    utilityBillsStatement:{type:String},
    passportDLCertificate:{type:String},
   // coverPicture: { type: String },
    bankDetails: { type: String },
    //videos: { type: [String] },
}, { _id: false });

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
        console.log(completedFields);
    });

    return Math.round((completedFields / fieldsToCheck.length) * 100);
};

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        default: () => nanoid(15),
        unique: true,
    },
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: (v) => emailRegex.test(v),
            message: (props) => `${props.value} is not a valid email address!`,
        },
    },
    password: { type: String, required: true },
    phoneNumber: { type: Number, required: true },
    isVerified: { type: Boolean},
    role: {
        type: String,
        required: true,
        enum: ['employee','employer', 'admin'],
    },
    profile: {
        profileCompletion: { type: Number, default: 0 },
        personalInformation: { type: personalInformationSchema },
        generalInformation: { type: generalInformationSchema },
        uploads: { type: uploadsSchema },
    },
    companyName:{
        type:String,
        
    },
    otp:{
        type:Number,
    },
    status:{
        type:String,
        enum:['active','inactive'],
        default:'inactive'
    },
    sessionInformation:{
       sessionId:{
        type:String
       },
       paidFor:{
        type:String,
       },


    },
    invites:{
        type:[String],
    }
},
{
    timestamps:true
}



);

// Recalculate profileCompletion before saving
UserSchema.pre('save', function (next) {
    if (this.isModified('profile')) {
        this.profile.profileCompletion = calculateProfileCompletion(this.profile);
    }
    next();
});

// Apply indexes only to specified fields
UserSchema.index({ name: 1 });
UserSchema.index({ userId: 1 });
UserSchema.index({role: 1});
UserSchema.index({ "profile.personalInformation.address.city": 1 });
UserSchema.index({ "profile.personalInformation.address.postCode": 1 });
UserSchema.index({ "profile.personalInformation.address.town": 1 });
UserSchema.index({ "profile.generalInformation.experience.title": 1 });
UserSchema.index({ "profile.generalInformation.experience.company": 1 });

// Middleware for findOneAndUpdate to update profileCompletion
UserSchema.pre('findOneAndUpdate', async function (next) {
    try {
        const update = this.getUpdate();
        if (update.profile) {
            // Retrieve the document to calculate profile completion
            const docToUpdate = await this.model.findOne(this.getQuery());

            // Merge the current profile with the update
            const updatedProfile = {
                ...docToUpdate.profile.toObject(),
                ...update.profile,
            };

            // Recalculate profileCompletion
            update['profile.profileCompletion'] = calculateProfileCompletion(updatedProfile);
            this.setUpdate(update);
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) {
            return next();
        }
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Add a method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Omit the password when returning the user
UserSchema.set("toJSON", {
    transform(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  });

const User = mongoose.model('User', UserSchema);
module.exports = User;
