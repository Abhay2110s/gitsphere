import mongoose from 'mongoose';

const codeCommentSchema = new mongoose.Schema(
  {
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodeFile',
      required: [true, 'File reference is required'],
      index: true
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required'],
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment author is required']
    },
    lineNumber: {
      type: Number,
      required: [true, 'Line number is required'],
      min: [1, 'Line number must be at least 1']
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    isResolved: {
      type: Boolean,
      default: false
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
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

// Compound index for line comments retrieval
codeCommentSchema.index({ file: 1, lineNumber: 1, createdAt: 1 });

const CodeComment = mongoose.model('CodeComment', codeCommentSchema);

export default CodeComment;
