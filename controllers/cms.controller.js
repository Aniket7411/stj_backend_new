const cmsModel = require("../models/cms.model")




exports.createCms = async (req, res) => {
    try {
        // Check if CMS entry already exists
        let cms = await cmsModel.findOne({ title: req.body.title });

        if (cms) {
            // Update existing CMS entry
            Object.assign(cms, req.body);
            await cms.save();

            return res.status(200).send({
                success: true,
                message: "CMS updated successfully",
                data: cms
            });
        } 
        
        // Create new CMS entry
        cms = await cmsModel.create(req.body);

        return res.status(201).send({
            success: true,
            message: "CMS created successfully",
            data: cms
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err?.message || "Internal Server Error"
        });
    }
};




exports.deleteCMS=async (req,res)=>{
    try{
        const {id}=req?.params
        const deleteCMS=await cmsModel.findByIdAndDelete(id);
        if(!deleteCMS){
            return res.status(404).send({
                message:"this cms does not exist",
                success:false
            })
        }
        // const newCategory=new JobCategory(req.body);
        // await newCategory.save();

        return res.status(200).send({
            message:'cms deleted successfully'
        })


    }catch(err){
        return res.status(404).json({
            message:err?.message
        })
    }
}



exports.getAllCMS=async (req,res)=>{
    try{
       // const {categoryName}=req?.body
        const cms=await cmsModel.find();
        if(!cms){
            return res.status(404).send({
                message:"no cms found",
                success:false
            })
        }
       // const newCategory=new JobCategory(req.body);
        //await newCategory.save();

        return res.status(200).send({
            message:'all cms found successfully',
            data:cms
        })


    }catch(err){
        return res.status(404).json({
            message:err?.message
        })
    }
}


exports.getCMSByEndPoint=async (req,res)=>{
    try{
       // const {categoryName}=req?.body
       const {endPoint}=req.query;
        const cms=await cmsModel.find({endPoint:endPoint});
        if(!cms){
            return res.status(404).send({
                message:"no cms found",
                success:false
            })
        }
       // const newCategory=new JobCategory(req.body);
        //await newCategory.save();

        return res.status(200).send({
            message:'all cms found successfully',
            data:cms
        })


    }catch(err){
        return res.status(404).json({
            message:err?.message
        })
    }
}







exports.getOneCms=async(req,res)=>{
    try{

        const {title}=req.query;
        const singleCms=await cmsModel.findOne({title:title});
        if(!singleCms){
            return res.status(400).send({
                message:"cms not found"
            })
        }

        return res.status(200).send({
            success:true,
            data:singleCms,
        })

    }catch(err){
        return res.status(500).send({
            success:false,
            message:err.message
        })
    }
}



exports.editOneCms = async (req, res) => {
    try {
        const { id, data } = req.body;

        const cms = await cmsModel.findByIdAndUpdate(
            id,
            { $set: data }, // Updates all fields in `data`
            { new: true, runValidators: true } // Ensures updated data is returned & validated
        );

        if (!cms) {
            return res.status(404).send({
                success: false,
                message: "CMS entry not found",
            });
        }

        return res.status(200).send({
            success: true,
            message: "Updated CMS successfully",
            data: cms, // Returns the updated CMS entry
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err?.message || "Internal Server Error",
        });
    }
};

