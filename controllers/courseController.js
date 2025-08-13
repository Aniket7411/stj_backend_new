const bookmarkModel = require('../models/bookmark.model');
const courseModels = require('../models/course.models');
const Course = require('../models/course.models');
const { CreateProductFunction } = require('./product.controller');


// Create a new course
exports.createCourse = async (req, res) => {
    try {
        const {userId} = req.user //!enable this if payload has the access token and append this inside the req.body as per the schema
        //console.log(req.body,"......9");
        req.body.createdBy=userId;
        //console.log(req.body,"......11");
        const newCourse = new Course(req.body);
        //console.log( newCourse,"......13");
        const savedCourse = await newCourse.save();
        let data={
            productName:savedCourse.courseDetails.title,
            price:savedCourse.courseDetails.amount,
            description:savedCourse.courseDetails.description,
            courseId:savedCourse._id.toString(),
            userId:savedCourse.userId
        }
        console.log(data)
       let CreateProduct= await CreateProductFunction(data);

       if(CreateProduct.success===false){
        return res.status(400).json(CreateProduct)
       }
       newCourse.productId=CreateProduct.productId
       await newCourse.save()
        //console.log( savedCourse,"......15");
        res.status(201).json(savedCourse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
    let { city, country, course, category, page = 1 ,distanceRange,type} = req.query;
    let userId="";
    if(req.user&&req.user.userId){
         userId=req?.user?.userId;
    }

    //console.log(req.query.city?true:false,"////////////////////////////////////////");

   
   

    // Define the filter object dynamically
    const filter = {
        'courseDetails.startDate': { $gte: new Date() }, // Ensure start date is not passed
        'courseDetails.enrollmentLimit': { $gt: 0},
    };

    //console.log(filter,"..............uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu")

    // Apply additional filters based on query parameters
    if (city) {
        filter['courseDetails.address.town_city'] = { $regex: city, $options: "i" };
    }
    if (country) {
        filter['courseDetails.address.country'] = { $regex: country, $options: "i" };
    }
    if (course) {
        filter['courseDetails.title'] = { $regex: course, $options: "i" };;
    }
    if (category) {
        filter['courseDetails.category'] = category;
    }
    if(type==='mycourse'){
        filter['createdBy']=req.user.userId
    }

     if(req.user&& req.user.userId&& req.user.role==='employee'){
         filter['enrolledCandidates'] = {
  $not: {
    $elemMatch: { userId: req.user.userId }
  }
};
    }

    // Pagination setup
    const limit = 21;
    const skip = (page - 1) * limit;

    try {
        console.log(filter,"...........58");
        // Fetch courses based on filters and apply pagination
        ////console.log(distanceRange,"...............56")
        let courses = await Course.find(filter).skip(skip).limit(limit);
        ////console.log('reached here',courses)
       
            if (userId.length>0 && req.user.role==='employee') {
      // Find all bookmarks for the user
      let bookmarks = await bookmarkModel.find({ createdBy: userId }).select('referenceId -_id');

      ////console.log(bookmarks,"...............................bookmarks")

      // Extract course IDs from the bookmarks
      const bookmarkedCourseIds = bookmarks.filter(bookmark => bookmark.status).map((bookmark) =>  bookmark.referenceId?bookmark.referenceId.toString() : null);
      const filteredCourse=bookmarkedCourseIds.filter((item)=>item!=null)

      console.log(filteredCourse,"..................................bookmarkedCourseIds")

      // Mark courses as bookmarked
      courses = courses.map((course) => ({
        ...course.toObject(),
        isBookmarked: filteredCourse.includes(course._id.toString()),
      }));

       console.log("81")
       if (distanceRange) {
                console.log("83")
               //let distanceRange=JSON.parse(distanceRange);
                function getCourseWithinDistance(userLat, userLng, jobs, maxDistanceKm) {
                    const EARTH_RADIUS_KM = 6371; // Radius of Earth in km
                    console.log(userLat,"userLat")
                     console.log(userLng,"userLng")
                      console.log(jobs,"jobs")
                       console.log(maxDistanceKm,"maxDistance")
                    // Haversine formula
                    function calculateDistance(lat1, lng1, lat2, lng2) {
                        //console.log(lat1,"lat1")
                        //console.log(lng1,"lng1")
                        //console.log(lat2,"lat2")
                        //console.log(lng2,"lat2")
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
                    return courses.filter((course) => {
                        const distance = calculateDistance(userLat, userLng, course.courseDetails.address.latitude,course.courseDetails.address.longitude);
                        return distance <= maxDistanceKm;
                    });
                }

               courses= getCourseWithinDistance(distanceRange.latitude,distanceRange.longitude,courses,distanceRange.range);
               console.log(courses,".................121")
                console.log("85")
            }
            console.log("123")
    }

    if(type){

    }


    //console.log("...................................",courses)
        

        // Count total documents for pagination info
        const totalCount = await Course.countDocuments(filter);

       return res.status(200).json({
            totalPages: Math.ceil(totalCount / limit),
            currentPage: Number(page),
            courses,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a course by ID
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a course by ID
exports.updateCourseById = async (req, res) => {
    try {
        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(updatedCourse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a course by ID
exports.deleteCourseById = async (req, res) => {
    try {
        const deletedCourse = await Course.findByIdAndDelete(req.params.id);
        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//get all purchased courses
exports.getPurchasedCourse=async(req,res)=>{
    try{
        //const {userId}=req.user;
        const purchasedCourses = await Course.find({
            enrolledCandidates: {
                $elemMatch: { userId: req.user.userId }
            }
        })
        return res.status(200).send({
            success:true,
            purchasedCourses
        })
      

    }catch(err){
         return res.status(400).send({
            success:false,
            message:err.message
        })


    }
}



//get course for admin
exports.getCourseForAdmin=async(req,res)=>{
    try{
        //hey, can you create a data list for admin where I can see the courseTitle, companyName,Educator,
        //company bank details,enrolledCandidate info,totalAmount...

        let filter={};
        if(req.query.createdBy){
            filter.createdBy=req.query.createdBy
        }

        const admin=await courseModels.find(filter).select(
            'courseDetails.title courseDetails.instructorName courseDetails.amount enrolledCandidates createdBy ');
       // admin=admin.find().populate()


        return res.status(200).send({
            success:true,
            data:admin
        })

    }catch(err){

    }
}

