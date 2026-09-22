import mongoose from 'mongoose';

const fileAttachmentSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true
    },
    url: {
      type: String,
      required: [true, 'File URL is required']
    },
    storageKey: {
      type: String,
      required: [true, 'Storage key is required']
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required']
    },
    size: {
      type: Number,
      required: [true, 'File size is required']
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader user ID is required']
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
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

fileAttachmentSchema.index({ project: 1, createdAt: -1 });
fileAttachmentSchema.index({ task: 1, createdAt: -1 });
fileAttachmentSchema.index({ uploadedBy: 1, createdAt: -1 });

const FileAttachment = mongoose.model('FileAttachment', fileAttachmentSchema);

export default FileAttachment;
