const JobCategory = require('../models/jobcategory.model');


exports.createCategory=async (req,res)=>{
    try{
        const {categoryName}=req?.body
        console.log(categoryName,"...............-7")
        const jobCategory=await JobCategory.find({categoryName:categoryName});
        console.log(jobCategory,"..........-9")
        if(jobCategory.length>0){
            return res.status(204).send({
                message:"this category already exist",
                success:false
            })
        }
        const newCategory=new JobCategory(req.body);
        await newCategory.save();

        return res.status(200).send({
            message:'category added successfully'
        })


    }catch(err){
        return res.status(204).json({
            message:err?.message
        })
    }
}



exports.deleteCategory=async (req,res)=>{
    try{
        const {id}=req?.params
        const jobCategory=await JobCategory.findByIdAndDelete(id);
        if(!jobCategory){
            return res.status(404).send({
                message:"this category does not exist",
                success:false
            })
        }
        // const newCategory=new JobCategory(req.body);
        // await newCategory.save();

        return res.status(200).send({
            message:'category deleted successfully'
        })


    }catch(err){
        return res.status(404).json({
            message:err?.message
        })
    }
}



exports.getAllCategory=async (req,res)=>{
    try{
       // const {categoryName}=req?.body
        const jobCategory=await JobCategory.find();
        if(!jobCategory){
            return res.status(404).send({
                message:"no category found",
                success:false
            })
        }
       // const newCategory=new JobCategory(req.body);
        //await newCategory.save();

        return res.status(200).send({
            message:'category found successfully',
            data:jobCategory
        })


    }catch(err){
        return res.status(404).json({
            message:err?.message
        })
    }
}





