import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB, disconnectDB } from "./src/config/db";
import { AuctionItem } from "./src/models/AuctionItem";
import { User } from "./src/models/User";
import { generateSlug, generateUniqueSlug } from "./src/utils/slug";

// Load environment variables
dotenv.config();

// Helper function to generate random future timestamp (5-48 hours from now)
const getRandomFutureTime = (): Date => {
  const now = Date.now();
  const minHours = 5;
  const maxHours = 48;
  const randomHours = Math.random() * (maxHours - minHours) + minHours;
  const futureTime = now + randomHours * 60 * 60 * 1000;
  return new Date(futureTime);
};

// Demo auction items
const demoAuctions = [
  {
    title: "iPhone 14 Pro Max 256GB",
    description: "Brand new iPhone 14 Pro Max in Space Black, 256GB storage, factory sealed with all accessories included.",
    imageUrls: ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop"],
    startingPrice: 899,
    minimumIncrement: 25,
    category: "Electronics" as const,
  },
  {
    title: "PlayStation 5 Digital Edition",
    description: "Sony PlayStation 5 Digital Edition console, brand new in box, includes controller and all original packaging.",
    imageUrls: ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&h=600&fit=crop"],
    startingPrice: 399,
    minimumIncrement: 20,
    category: "Electronics" as const,
  },
  {
    title: "Air Jordan 1 Retro High OG",
    description: "Authentic Air Jordan 1 Retro High OG sneakers in Chicago colorway, size 10, deadstock condition.",
    imageUrls: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop"],
    startingPrice: 250,
    minimumIncrement: 15,
    category: "Fashion" as const,
  },
  {
    title: "MacBook Air M2 13-inch",
    description: "Apple MacBook Air with M2 chip, 8GB RAM, 256GB SSD, Space Gray, excellent condition with original charger.",
    imageUrls: ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop"],
    startingPrice: 999,
    minimumIncrement: 50,
    category: "Electronics" as const,
  },
  {
    title: "Canon EOS R6 Mark II DSLR Camera",
    description: "Professional Canon EOS R6 Mark II mirrorless camera body, like new condition, includes battery and charger.",
    imageUrls: ["https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=600&fit=crop"],
    startingPrice: 2499,
    minimumIncrement: 100,
    category: "Electronics" as const,
  },
  {
    title: "Ergonomic Gaming Chair",
    description: "Premium ergonomic gaming chair with lumbar support, adjustable height, and RGB lighting, black and red design.",
    imageUrls: ["https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop"],
    startingPrice: 299,
    minimumIncrement: 20,
    category: "Home & Garden" as const,
  },
  {
    title: "Apple Watch Series 9 45mm",
    description: "Apple Watch Series 9 GPS + Cellular, 45mm Midnight case with Sport Band, brand new sealed.",
    imageUrls: ["https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&h=600&fit=crop"],
    startingPrice: 429,
    minimumIncrement: 25,
    category: "Electronics" as const,
  },
  {
    title: "DJI Mini 3 Pro Drone",
    description: "DJI Mini 3 Pro drone with 4K camera, 3-axis gimbal, includes remote controller and carrying case.",
    imageUrls: ["https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&h=600&fit=crop"],
    startingPrice: 759,
    minimumIncrement: 30,
    category: "Electronics" as const,
  },
  {
    title: "Fender Stratocaster Electric Guitar",
    description: "Classic Fender Stratocaster electric guitar, sunburst finish, excellent condition with hard case included.",
    imageUrls: ["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop"],
    startingPrice: 699,
    minimumIncrement: 35,
    category: "Collectibles" as const,
  },
  {
    title: "Apple AirPods Pro 2nd Generation",
    description: "Apple AirPods Pro with MagSafe Charging Case, active noise cancellation, brand new in sealed box.",
    imageUrls: ["https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop"],
    startingPrice: 249,
    minimumIncrement: 15,
    category: "Electronics" as const,
  },
];

const seedAuctions = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();
    console.log("Connected to MongoDB");

    // Check existing auctions count (for info only)
    const existingAuctions = await AuctionItem.countDocuments();
    if (existingAuctions > 0) {
      console.log(`Found ${existingAuctions} existing auctions. Adding demo auctions...`);
    } else {
      console.log("No auctions found. Starting seed...");
    }

    // Find or create a demo seller user
    let demoSeller = await User.findOne({ email: "demo@bidflow.com" });
    
    if (!demoSeller) {
      console.log("Creating demo seller user...");
      demoSeller = await User.create({
        username: "DemoSeller",
        email: "demo@bidflow.com",
        password: "demo123456", // Will be hashed by pre-save hook
        role: "seller",
        walletBalance: 0,
        blockedBalance: 0,
      });
      console.log(`Demo seller created: ${demoSeller.username}`);
    } else {
      console.log(`Using existing demo seller: ${demoSeller.username}`);
    }

    // Create auctions
    const now = new Date();
    const createdAuctions = [];

    for (const auctionData of demoAuctions) {
      const endTime = getRandomFutureTime();
      const startTime = new Date(now.getTime() - 60 * 60 * 1000); // Start time 1 hour in the past to ensure it's live

      // Generate unique slug
      const baseSlug = generateSlug(auctionData.title);
      const slug = await generateUniqueSlug(baseSlug, async (s) => {
        const exists = await AuctionItem.findOne({ slug: s });
        return !!exists;
      });

      const auction = await AuctionItem.create({
        ...auctionData,
        slug,
        seller: demoSeller._id,
        status: "live",
        startTime,
        endTime,
        currentPrice: auctionData.startingPrice,
      });

      createdAuctions.push(auction);
      console.log(`✓ Created auction: ${auction.title} (ends in ${Math.round((endTime.getTime() - now.getTime()) / (1000 * 60 * 60))} hours)`);
    }

    console.log(`\n✅ Successfully seeded ${createdAuctions.length} auctions!`);
    console.log(`Demo seller: ${demoSeller.username} (${demoSeller.email})`);

    // Disconnect from database
    await disconnectDB();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding auctions:", error);
    await disconnectDB();
    process.exit(1);
  }
};

// Run the seed function
seedAuctions();

