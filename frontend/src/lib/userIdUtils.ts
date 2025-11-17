/**
 * Safely extracts user ID from various formats:
 * - string: returns the string directly
 * - { _id: string }: returns the _id value
 * - { id: string }: returns the id value (for User type or objects with id field)
 * - null | undefined: returns undefined
 */
export const extractUserId = (
  user: string | { _id: string } | { id: string } | { id?: string; [key: string]: unknown } | null | undefined
): string | undefined => {
  if (!user) return undefined;
  
  if (typeof user === "string") {
    return user;
  }
  
  if (typeof user === "object" && user !== null) {
    // Handle { _id: string }
    if ("_id" in user && typeof user._id === "string") {
      return user._id;
    }
    // Handle { id: string } (for User type or objects with id field)
    if ("id" in user && typeof user.id === "string") {
      return user.id;
    }
  }
  
  return undefined;
};

