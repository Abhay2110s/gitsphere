import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: [true, 'File path is required'],
      trim: true
    },
    content: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'javascript',
      trim: true,
      lowercase: true
    }
  },
  { _id: false }
);

const contributionSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required']
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required']
    },
    developer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Developer reference is required']
    },
    version: {
      type: Number,
      required: [true, 'Version number is required']
    },
    files: {
      type: [fileSchema],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: 'At least one file is required in a contribution'
      }
    },
    status: {
      type: String,
      enum: {
        values: ['DRAFT', 'IN_REVIEW', 'APPROVED', 'CHANGES_REQUESTED'],
        message: '{VALUE} is not a valid contribution status'
      },
      default: 'DRAFT'
    },
    submittedAt: {
      type: Date,
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewComment: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Review comment cannot exceed 2000 characters']
    },
    projectSnapshot: {
      type: [fileSchema],
      default: []
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

// Indexes for efficient querying
contributionSchema.index({ project: 1, version: -1 });
contributionSchema.index({ project: 1, status: 1 });
contributionSchema.index({ task: 1 });
contributionSchema.index({ developer: 1 });

// Enforce snapshot immutability
contributionSchema.pre('save', function (next) {
  if (!this.isNew) {
    if (
      this.isModified('version') ||
      this.isModified('project') ||
      this.isModified('task') ||
      this.isModified('developer')
    ) {
      return next(new Error('Contribution core metadata (version, project, task, developer) is immutable'));
    }
    // Files are immutable once submitted
    if (this.isModified('files') && this.status !== 'DRAFT') {
      return next(new Error('Contribution files cannot be modified once submitted'));
    }
  }
  next();
});

const Contribution = mongoose.model('Contribution', contributionSchema);

export default Contribution;
