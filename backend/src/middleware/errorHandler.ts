import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/errors";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Handle regular Error objects - show their message instead of generic error
  if (err instanceof Error) {
    console.error(err);
    // Check if it's a validation/insufficient balance error (400-level)
    const errorMessage = err.message.toLowerCase();
    if (
      errorMessage.includes("insufficient") ||
      errorMessage.includes("balance") ||
      errorMessage.includes("must be") ||
      errorMessage.includes("required") ||
      errorMessage.includes("not found") ||
      errorMessage.includes("unauthorized")
    ) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    
    // For other errors, return 500 but still show the message in development
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === "production" 
        ? "Internal server error" 
        : err.message,
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

