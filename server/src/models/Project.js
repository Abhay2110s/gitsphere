import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters long'],
      maxlength: [100, 'Project name cannot exceed 100 characters']
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project creator (Manager) is required']
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    status: {
      type: String,
      enum: {
        values: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'],
        message: '{VALUE} is not a valid project status'
      },
      default: 'PLANNING'
    },
    startDate: {
      type: Date
    },
    deadline: {
      type: Date
    },
    repositoryUrl: {
      type: String,
      default: '',
      trim: true
    },
    currentVersion: {
      type: Number,
      default: 0
    },
    currentFiles: [
      {
        path: {
          type: String,
          required: true
        },
        content: {
          type: String,
          default: ''
        },
        language: {
          type: String,
          default: 'javascript'
        },
        _id: false
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

// Indexes as required in Section 41
projectSchema.index({ createdBy: 1 });
projectSchema.index({ members: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
