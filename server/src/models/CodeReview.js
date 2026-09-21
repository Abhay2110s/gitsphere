import mongoose from 'mongoose';

const codeReviewSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required'],
      index: true
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Submitter reference is required']
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'APPROVED', 'CHANGES_REQUESTED'],
        message: '{VALUE} is not a valid review status'
      },
      default: 'PENDING'
    },
    summary: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Summary cannot exceed 2000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
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

codeReviewSchema.index({ task: 1, createdAt: -1 });

const CodeReview = mongoose.model('CodeReview', codeReviewSchema);

export default CodeReview;
