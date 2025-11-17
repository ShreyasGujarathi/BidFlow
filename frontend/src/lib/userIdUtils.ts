import { UserIdReference } from "./types";

/**
 * Safely extracts user ID from various formats (string, object with _id, object with id)
 */
export const extractUserId = (user: string | UserIdReference | null | undefined): string | undefined => {
  if (!user) return undefined;
  
  if (typeof user === "string") {
    return user;
  }
  
  if (typeof user === "object" && user !== null) {
    // Try _id first
    if (user._id) {
      if (typeof user._id === "string") {
        return user._id;
      } else if (typeof user._id === "object" && user._id !== null && "toString" in user._id && typeof user._id.toString === "function") {
        return user._id.toString();
      } else {
        return String(user._id);
      }
    }
    
    // Fallback to id
    if (user.id) {
      return String(user.id);
    }
  }
  
  return undefined;
};

