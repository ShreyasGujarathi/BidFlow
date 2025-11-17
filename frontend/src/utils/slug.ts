/**
 * Generates a URL-friendly slug from a string (matches backend logic)
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

/**
 * Creates an auction URL from auction data
 */
export const getAuctionUrl = (auction: { _id: string; slug: string; title: string }): string => {
  const slug = auction.slug || generateSlug(auction.title);
  return `/auctions/${slug}-${auction._id}`;
};

