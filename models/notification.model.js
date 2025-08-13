const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {

    notifications:[{
      title: {
        type: String,
        required: true,
        trim: true,
      },
      body: {
        type: String,
        required: true,
        trim: true,
      },
      link:{
         type: String,
      },
      type: {
        type: String,
       // enum: ['info', 'warning', 'alert', 'message'],
       // default: 'info',
      },
      isRead: {
        type: Boolean,
        default: false,
      },
      sentAt: {
        type: Date,
        default: Date.now,
      },

    }],
   
    userId: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      default: {},
    },
   
  },
  {
    timestamps: true, // createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
