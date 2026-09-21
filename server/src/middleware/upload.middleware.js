import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { AppError } from '../utils/response.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Disallowed executable extensions
const DISALLOWED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.bin', '.msi', '.dll',
  '.com', '.vbs', '.ps1', '.scr', '.jar', '.apk', '.app'
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Local disk storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

// File filter enforcing security rules
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Rule: Never allow arbitrary executable uploads
  if (DISALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new AppError(
        `Executable files (${ext}) are not permitted for security reasons.`,
        400,
        'DISALLOWED_FILE_TYPE'
      ),
      false
    );
  }

  // Allowed MIME types: images, text/code, documents, archives
  const allowedMimePrefixes = [
    'image/',
    'text/',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument',
    'application/zip',
    'application/x-zip-compressed',
    'application/json',
    'application/javascript',
    'application/octet-stream' // generic binary/code
  ];

  const isAllowed = allowedMimePrefixes.some((prefix) =>
    prefix.endsWith('/') ? file.mimetype.startsWith(prefix) : file.mimetype === prefix
  );

  if (!isAllowed) {
    return cb(
      new AppError(
        `File type "${file.mimetype}" is not supported.`,
        400,
        'UNSUPPORTED_FILE_TYPE'
      ),
      false
    );
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter
});
