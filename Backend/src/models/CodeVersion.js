import mongoose from 'mongoose';

const codeVersionSchema = new mongoose.Schema(
  {
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodeFile',
      required: [true, 'Code file reference is required'],
      index: true
    },
    versionNumber: {
      type: Number,
      required: [true, 'Version number is required']
    },
    content: {
      type: String,
      required: [true, 'Version code content is required']
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author of this version change is required']
    },
    commitMessage: {
      type: String,
      default: 'Saved code version',
      trim: true,
      maxlength: [200, 'Commit message cannot exceed 200 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
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

// Compound index for querying version history in reverse order
codeVersionSchema.index({ file: 1, versionNumber: -1 });

const CodeVersion = mongoose.model('CodeVersion', codeVersionSchema);

export default CodeVersion;
