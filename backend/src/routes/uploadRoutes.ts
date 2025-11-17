import { Router, Request, Response, NextFunction } from "express";
import { uploadImagesController } from "../controllers/uploadController";
import { authenticate } from "../middleware/auth";
import { upload } from "../middleware/upload";
import multer from "multer";

const router = Router();

// Error handler for multer errors (must be defined before route)
const handleMulterError = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum file size is 10MB.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum 10 files allowed.",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field. Use 'images' field name.",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error",
    });
  }
  
  // Handle other upload errors
  if (err instanceof Error && err.message.includes("Invalid file type")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  
  next(err);
};

// Upload multiple images
// Authentication reads from headers (available before body parsing)
// Multer parses the multipart/form-data after authentication
router.post(
  "/images",
  authenticate, // Authenticate first (reads Authorization header)
  (req: Request, res: Response, next: NextFunction) => {
    upload.array("images", 10)(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  uploadImagesController
);

export default router;

