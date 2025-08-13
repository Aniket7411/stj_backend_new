const supportModel = require("../models/support.model")




exports.createSupport = async (req, res) => {
    try {
        // Create new CMS entry
        let support = await supportModel.create(req.body);

        return res.status(201).send({
            success: true,
            message: "your message was recorded. we will revert back soon",
            data: support
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err?.message || "Internal Server Error"
        });
    }
};




exports.getAllSupport=async (req,res)=>{
    try{
       // const {categoryName}=req?.body
        const support=await supportModel.find().sort({createdAt:-1});
        if(!support){
            return res.status(404).send({
                message:"no cms found",
                success:false
            })
        }
       // const newCategory=new JobCategory(req.body);
        //await newCategory.save();

        return res.status(200).send({
            message:'all cms found successfully',
            data:support
        })


    }catch(err){
        return res.status(404).json({
            message:err?.message
        })
    }
}


// exports.getCMSByEndPoint=async (req,res)=>{
//     try{
//        // const {categoryName}=req?.body
//        const {endPoint}=req.query;
//         const cms=await supportModel.find({endPoint:endPoint});
//         if(!cms){
//             return res.status(404).send({
//                 message:"no cms found",
//                 success:false
//             })
//         }
//        // const newCategory=new JobCategory(req.body);
//         //await newCategory.save();

//         return res.status(200).send({
//             message:'all cms found successfully',
//             data:cms
//         })


//     }catch(err){
//         return res.status(404).json({
//             message:err?.message
//         })
//     }
// }







exports.getOneCms=async(req,res)=>{
    try{

        const {title}=req.query;
        const singleCms=await supportModel.findOne({title:title});
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

        const cms = await supportModel.findByIdAndUpdate(
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

