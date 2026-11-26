import { Router, Request, Response } from 'express';
import { validateUploadSecurity } from '../middleware/security';

/**
 * Upload Security Validation Router
 * @description Inspects binary magic numbers on uploaded telemetry files
 */
export const securityRouter = Router();

/**
 * Binary magic bytes validation endpoint for telemetry/sensor log uploads
 * @route POST /api/security/validate-upload
 */
securityRouter.post('/validate-upload', validateUploadSecurity, (req: Request, res: Response) => {
  const validatedBuffer = req.body.validatedBuffer as Buffer;
  const fileName = req.body.fileName || 'sensor_upload.json';

  res.json({
    status: 'success',
    fileName,
    byteLength: validatedBuffer.length,
    message: 'Binary magic number validation passed. File is clean and safe for processing.',
  });
});
