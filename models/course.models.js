const mongoose = require('mongoose');

const addressSchema = mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    postCode: {
        type: Number,
        required: true
    },
    country: { type: String },
    town_city: { type: String, required: true },
    latitude:{type:Number,required:true},
    longitude:{type:Number,required:true},

},
    { _id: false }
)

const courseDetailsSchema = mongoose.Schema({
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    instructorName:{type:String,required:true},
    startTime: {
        type: {
            hour: { type: Number, required: true },
            mins: { type: Number, required: true },
            am_pm: { type: String, required: true },

        },
        _id: false
    },
    endTime: {
        type: {
            hour: { type: Number, required: true },
            mins: { type: Number, required: true },
            am_pm: { type: String, required: true },
        },
        _id: false
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    days: {
        type: [String],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    enrollmentLimit: {
        type: Number,
        required: true
    },
    address: { type: addressSchema, required: true }

}, { _id: false });


// Pre-save middleware to calculate duration
courseDetailsSchema.pre('save', function (next) {
    if (this.startDate && this.endDate) {
      const timeDiff = this.endDate - this.startDate;
      this.duration = timeDiff >= 0 ? Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) : 0;
    } else {
      this.duration = 0; // Default duration if dates are invalid
    }
    next();
  });

const courseRequirementSchema = mongoose.Schema({
    courseDescription: {
        type: String,
        required: true
    },
    courseRequirements: {
        type: [String],
        required: true
    },
    courseIsFor: {
        type: [String],
        required: true
    }

},
    { _id: false }
);

const courseCertificatesSchema = mongoose.Schema({
    courseImage: { type: String },
    certificateImage: { type: String },
    declaration: { type: Boolean, default: false, required: true }
},
    { _id: false }
)

const createCourseSchema = mongoose.Schema({
    createdBy:{type:String,required:true},
    verified:{type:Boolean, default:null},
    courseDetails: { type: courseDetailsSchema },
    courseRequirement: { type: courseRequirementSchema },
    courseCertificates:{ type:courseCertificatesSchema},
    enrolledCandidates:[{
        name:{type:String},
        email:{type:String},
        contact:{type:String},
        userId:{type:String},
    }],
    productId:{type:String}
},
{
    timestamps:true
}



);


module.exports = mongoose.model('Course', createCourseSchema);