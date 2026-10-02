import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Message sender is required']
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required']
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      minlength: [1, 'Message cannot be empty'],
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FileAttachment'
      }
    ],
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
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

// Database Indexes as defined in Section 41 + 10-day TTL auto-expiry index
messageSchema.index({ project: 1, createdAt: -1 });
messageSchema.index({ task: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
// Auto-expire messages after 10 days (864,000 seconds)
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 864000 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
