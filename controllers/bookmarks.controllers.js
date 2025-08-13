const Courses = require('../models/course.models'); // Assuming the Proposal model is saved in ./models/proposal
const Bookmarks=require('../models/bookmark.model');



const Bookmark = require('../models/bookmark.model'); // Replace with your actual model

// exports.updateBookmark = async (req, res) => {
//   try {
//     const {referenceId, status,type } = req.body;
//     console.log(req.user)
//     const createdBy=req.user.userId
//     //console.log(courseId,"...",status,"...",createdBy)

//     if (!createdBy || !referenceIdId || !status) {
//       return res.status(400).send({
//         message: 'createdBy, courseId, and status are required',
//       });
//     }

//     // Check if the bookmark exists
//     let bookmark = await Bookmark.findOne({ createdBy, courseId });

//     if (bookmark) {
//       // Update the existing bookmark
//       bookmark.status = status;
//       await bookmark.save();
//       return res.status(200).send({
//         message: 'Bookmark updated successfully',
//         bookmark,
//       });
//     } else {
//       // Create a new bookmark
//       bookmark = new Bookmark({ createdBy, courseId, status });
//       await bookmark.save();
//       return res.status(201).send({
//         message: 'Bookmark created successfully',
//         bookmark,
//       });
//     }
//   } catch (err) {
//     return res.status(500).send({
//       message: err.message,
//     });
//   }
// };

exports.updateBookmark = async (req, res) => {
  try {
    const { type, referenceId, status } = req.body; // `type` can be 'job' or 'course'
    const createdBy = req.user.userId;
    console.log(type,"....",referenceId,"....",status,"....",createdBy,"....",)

    if (!type || !referenceId || !createdBy) {
      return res.status(400).send({
        message: 'type, referenceId, status, and createdBy are required',
      });
    }

    if (!['job', 'course'].includes(type)) {
      return res.status(400).send({
        message: 'Invalid type. Must be either "job" or "course".',
      });
    }

    // Check if the bookmark exists
    let bookmark={};
    if(type==='job'){
       bookmark = await Bookmark.findOne({ createdBy, jobId:referenceId, type });
    }
    else if(type==='course'){
       bookmark = await Bookmark.findOne({ createdBy, referenceId, type });
    }
    
    let bookmarkNew={};

    if (bookmark) {
      // Update the existing bookmark
      console.log(bookmark,"...............79")
      bookmark.status = bookmark?.status===true?false:true;
      bookmark.updatedAt = Date.now();
      await bookmark.save();
      return res.status(200).send({
        message: `${type} bookmark updated successfully`,
        bookmark,
      });
    } 
    else if(type==='job'){
      // Create a new bookmark
      bookmarkNew = new Bookmark({
        createdBy,
        jobId:referenceId,
        type,
        status:true,
      });
     
    }
    else if(type==='course'){
      bookmarkNew = new Bookmark({
        createdBy,
        referenceId:referenceId,
        type,
        status,
      });

    }
    else{
      return res.status(500).send({
        message: "there is some error"
      });
    }
    await bookmarkNew.save();
    return res.status(200).send({
      message: `${type} bookmark created successfully`,
      bookmarkNew,
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    });
  }
};



exports.getBookmarksByUser = async (req, res) => {
    try {
      const createdBy  = req?.user?.userId;
      const {type}=req.query;
  
      if (!createdBy) {
        return res.status(400).send({
          message: 'User ID (createdBy) is required',
        });
      }
  
      // Fetch all bookmarks for the user
      let bookmarks=[],bookmarkData=[]
      if(type==='job'){
         bookmarks = await Bookmark.find({ createdBy,status:true}).populate('jobId');
         bookmarkData = bookmarks.map((bookmark) => bookmark.jobId);

      }
      else if(type==='course'){
       bookmarks = await Bookmark.find({ createdBy,status:true }).populate('referenceId');
       bookmarkData = bookmarks.map((bookmark) => bookmark.referenceId);
      }
      
      //const filterCourses = courses.filter(course => course !== null);

  
      if (!bookmarks || bookmarks.length === 0) {
        return res.status(404).send({
          message: 'No bookmarks found for this user',
        });
      }
  
      return res.status(200).send({
        message: 'Bookmarks retrieved successfully',
        bookmarks:bookmarkData,
      });
    } catch (err) {
      return res.status(500).send({
        message: err.message,
      });
    }
  };
