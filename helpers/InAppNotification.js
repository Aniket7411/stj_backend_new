const Notification = require('../models/notification.model');


const notification = {
    title: "System Maintenance",
    body: "We will be down for maintenance at 11 PM UTC.",
    type: "alert",
    isRead: false,
  };

exports.sendNotificationsToUsers = async (userIds, notification) => {
  try {
    // Step 1: Find existing notification docs for userIds
    console.log(notification,"....................................")
    const existingDocs = await Notification.find(
      { userId: { $in: userIds } },
      'userId'
    );

    const existingUserIdsSet = new Set(existingDocs.map(doc => doc.userId.toString()));

    // Step 2: Prepare bulk operations
    const bulkOps = [];

    // Push to existing docs
    for (const userId of userIds) {
      if (existingUserIdsSet.has(userId.toString())) {
        bulkOps.push({
          updateOne: {
            filter: { userId },
            update: { $push: { notifications: notification } }
          }
        });
      } else {
        console.log(".........................................coming here 34");
        bulkOps.push({
          insertOne: {
            document: {
              userId,
              notifications: [notification],
              sentAt: new Date()
            }
          }
        });
        console.log(bulkOps,"................................44")
      }
    }

    // Step 3: Execute all operations in one go
    if (bulkOps.length > 0) {
      await Notification.bulkWrite(bulkOps);
    }

    return { success: true, message: 'Notifications sent successfully' };
  } catch (error) {
    console.error('sendNotificationsToUsers error:', error);
    return { success: false, message: 'Error sending notifications' };
  }
};



exports.getNotification=async(req,res)=>{
    try{
        const {userId}=req.user;
        const existingNotification = await Notification.findOne({ userId: userId });
        
        console.log(existingNotification,"existingNotication,,,,,,,,,,,,")

         const sorted = existingNotification.notifications.sort(
      (a, b) => new Date(b.sentAt) - new Date(a.sentAt)
    );


        

        if (existingNotification) {
          // Update each notification object's isRead field to true
          const updatedNotifications = existingNotification.notifications.map(notification => ({
            ...notification.toObject(),
            isRead: true,
          }));
        
          const updatedDoc = await Notification.findOneAndUpdate(
            { userId: userId },
            {
              $set: {
                notifications: updatedNotifications,
              },
            },
            { new: true } // returns the updated document
          );


          
        
          console.log(updatedDoc);
        }
        
        
       // let unread=notification.filter((item)=>item.isRead===false);

        if(!existingNotification){
            return res.status(400).send({
                success:false,
                message:"you do not have any notification"
            })
        }


        return res.status(200).send({
            success:true,
            message:"recieved all notifications",
            data:sorted
        })   

    }catch(err){
        return res.status(400).send({
            success:false,
            message:err.message
        })
    }
}








