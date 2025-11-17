import { Request, Response } from "express";
import multer from "multer";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";

export const uploadImagesController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      throw new Error("No files uploaded");
    }

    // Generate URLs for uploaded files
    const imageUrls = files.map((file) => {
      // Return URL path (not full URL, frontend will construct)
      return `/uploads/${file.filename}`;
    });

    res.status(200).json(ok({ imageUrls }));
  }
);

// Error handler for multer errors
export const handleUploadError = (
  err: unknown,
  req: Request,
  res: Response,
  next: (err: unknown) => void
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
  if (err instanceof Error) {
    if (err.message.includes("Invalid file type")) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }
  
  next(err);
};

