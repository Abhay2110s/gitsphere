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
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        ret.name = ret.fileName;
        ret.path =
          !ret.filePath || ret.filePath === '/'
            ? ret.fileName
            : `${ret.filePath.replace(/^\/+|\/+$/g, '')}/${ret.fileName}`;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        ret.name = ret.fileName;
        ret.path =
          !ret.filePath || ret.filePath === '/'
            ? ret.fileName
            : `${ret.filePath.replace(/^\/+|\/+$/g, '')}/${ret.fileName}`;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

codeFileSchema.virtual('name').get(function () {
  return this.fileName;
});

codeFileSchema.virtual('path').get(function () {
  if (!this.filePath || this.filePath === '/') {
    return this.fileName;
  }
  const cleanPath = this.filePath.replace(/^\/+|\/+$/g, '');
  return `${cleanPath}/${this.fileName}`;
});

// Compound unique index ensuring unique file paths within the same task
codeFileSchema.index({ task: 1, filePath: 1, fileName: 1 }, { unique: true });

const CodeFile = mongoose.model('CodeFile', codeFileSchema);

export default CodeFile;
