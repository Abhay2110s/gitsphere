import { Router } from 'express';
import * as attachmentController from '../controllers/attachment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.use(authenticate);

// Upload file
router.post('/upload', upload.single('file'), attachmentController.uploadAttachment);

// Get attachments
router.get('/', attachmentController.getAttachments);

// Delete attachment
router.delete('/:id', attachmentController.deleteAttachment);

export default router;
