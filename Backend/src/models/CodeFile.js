import mongoose from 'mongoose';

const codeFileSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required'],
      index: true
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
      minlength: [1, 'File name cannot be empty'],
      maxlength: [100, 'File name cannot exceed 100 characters']
    },
    filePath: {
      type: String,
      default: '/',
      trim: true
    },
    language: {
      type: String,
      default: 'javascript',
      trim: true,
      lowercase: true
    },
    content: {
      type: String,
      default: '// Start coding here...\n'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'File creator is required']
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    version: {
      type: Number,
      default: 1
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

// Compound unique index ensuring unique file paths within the same task
codeFileSchema.index({ task: 1, filePath: 1, fileName: 1 }, { unique: true });

const CodeFile = mongoose.model('CodeFile', codeFileSchema);

export default CodeFile;
