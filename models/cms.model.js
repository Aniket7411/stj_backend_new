const mongoose = require('mongoose');

const cmsSchema = mongoose.Schema({
    title: { type: String, required: true,unique:true },
    status: { type: String,required:true,default:"inactive",enum:['active','inactive'] },
    content:{type:String,required:true},
    metaTitle:{type:String},
    metaDescription:{type:String},
    images:{type:[String]},
    endPoint:{type:String,required:true}
}, {
    timestamps: true,
}
);

module.exports = mongoose.model("CMS", cmsSchema);