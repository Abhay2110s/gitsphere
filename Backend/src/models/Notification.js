import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification recipient is required']
    },
    type: {
      type: String,
      enum: {
        values: [
          'TASK_ASSIGNED',
          'TASK_UPDATED',
          'TASK_STATUS_CHANGED',
          'CODE_SUBMITTED',
          'CODE_REVIEWED',
          'CODE_APPROVED',
          'CHANGES_REQUESTED_NOTIFICATION',
          'COMMENT_ADDED',
          'MEMBER_ADDED',
          'MESSAGE_RECEIVED',
          'DEADLINE_APPROACHING'
        ],
        message: '{VALUE} is not a valid notification type'
      },
      required: [true, 'Notification type is required']
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Database Indexes as defined in Section 41
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });

// Automatically remove older notifications after a fixed time (Default: 30 days, configurable via NOTIFICATION_TTL_DAYS)
const NOTIFICATION_TTL_DAYS = parseInt(process.env.NOTIFICATION_TTL_DAYS, 10) || 30;
const NOTIFICATION_TTL_SECONDS = parseInt(process.env.NOTIFICATION_TTL_SECONDS, 10) || NOTIFICATION_TTL_DAYS * 24 * 60 * 60;
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: NOTIFICATION_TTL_SECONDS });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
