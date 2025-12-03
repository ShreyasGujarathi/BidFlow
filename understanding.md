# BidFlow - Complete Project Understanding Guide

> **A comprehensive guide to understanding every aspect of the BidFlow auction platform. Written for absolute beginners to help you confidently answer any interview question.**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Tech Stack](#2-architecture--tech-stack)
3. [Project Structure](#3-project-structure)
4. [Core Features Explained](#4-core-features-explained)
5. [Database Models & Relationships](#5-database-models--relationships)
6. [API Endpoints & Routes](#6-api-endpoints--routes)
7. [Real-time Communication (Socket.io)](#7-real-time-communication-socketio)
8. [Authentication & Security](#8-authentication--security)
9. [Wallet System Deep Dive](#9-wallet-system-deep-dive)
10. [Frontend Architecture](#10-frontend-architecture)
11. [Common Interview Questions & Answers](#11-common-interview-questions--answers)

---

## 1. Project Overview

### What is BidFlow?

**BidFlow** is a real-time auction platform where users can:
- **Sell items** by creating auctions with images, descriptions, and pricing
- **Buy items** by placing bids on live auctions
- **Watch auctions** they're interested in
- **Auto-bid** up to a maximum amount
- **Track their activity** through detailed dashboards

### Key Characteristics

- **Real-time**: Live updates using WebSocket connections (Socket.io)
- **Full-stack**: Next.js frontend + Express backend
- **Type-safe**: TypeScript throughout
- **Modern UI**: Glassmorphism design with dark/light themes
- **Secure**: JWT authentication, password hashing, role-based access

### Business Logic Flow

1. **Seller** creates an auction → Auction starts at scheduled time → Goes **live**
2. **Buyers** place bids → Highest bidder's funds are **blocked** → Others can outbid
3. When outbid → Previous bidder's funds are **released immediately**
4. Auction ends → Winner's funds are **captured** → Others' funds released
5. Real-time notifications sent to all relevant users

---

## 2. Architecture & Tech Stack

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.0.0 | React framework with SSR, routing, and optimization |
| **React** | 19.0.0 | UI library for building components |
| **TypeScript** | 5.6.3 | Type safety and better developer experience |
| **TailwindCSS** | 3.4.14 | Utility-first CSS framework for styling |
| **Socket.io Client** | 4.8.1 | Real-time WebSocket communication |
| **SWR** | 2.3.6 | Data fetching, caching, and revalidation |
| **Recharts** | 3.4.1 | Charts and data visualization for dashboards |
| **date-fns** | 3.6.0 | Date manipulation and formatting |

**Why these choices?**
- **Next.js**: Server-side rendering for SEO, automatic code splitting, built-in routing
- **TypeScript**: Catches errors at compile time, better IDE support
- **SWR**: Automatic caching, revalidation, and request deduplication
- **Socket.io**: Handles WebSocket connections with fallback to polling

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime environment |
| **Express** | 5.1.0 | Web framework for building REST APIs |
| **TypeScript** | 5.9.3 | Type safety on backend |
| **MongoDB** | - | NoSQL database for flexible data storage |
| **Mongoose** | 8.19.3 | MongoDB object modeling (ODM) |
| **Socket.io** | 4.8.1 | Real-time bidirectional communication |
| **JWT** | 9.0.2 | Secure token-based authentication |
| **bcryptjs** | 3.0.3 | Password hashing |
| **Multer** | 2.0.2 | File upload handling |

**Why these choices?**
- **Express**: Lightweight, flexible, widely used
- **MongoDB**: Flexible schema, good for auction data with varying structures
- **Mongoose**: Provides validation, middleware, and type safety
- **Socket.io**: Handles real-time updates efficiently with room management

### Architecture Pattern

```
┌─────────────────┐
│   Next.js App   │  (Frontend - Port 3000)
│   (React/TS)    │
└────────┬────────┘
         │ HTTP REST API
         │ WebSocket (Socket.io)
         ▼
┌─────────────────┐
│  Express Server │  (Backend - Port 5000)
│   (Node.js/TS)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    MongoDB      │  (Database)
│   (Mongoose)    │
└─────────────────┘
```

**Communication Flow:**
1. **HTTP Requests**: REST API calls for CRUD operations
2. **WebSocket**: Real-time updates (bids, auction status, notifications)
3. **Database**: All persistent data stored in MongoDB

---

## 3. Project Structure

### Backend Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── db.ts        # MongoDB connection
│   │   ├── env.ts       # Environment variables
│   │   └── socket.ts    # Socket.io setup
│   │
│   ├── controllers/     # Route handlers (request/response logic)
│   │   ├── authController.ts
│   │   ├── auctionController.ts
│   │   ├── bidController.ts
│   │   ├── walletController.ts
│   │   └── ...
│   │
│   ├── middleware/      # Request processing middleware
│   │   ├── auth.ts      # JWT authentication
│   │   ├── errorHandler.ts
│   │   └── upload.ts    # File upload handling
│   │
│   ├── models/          # Database schemas (Mongoose)
│   │   ├── User.ts
│   │   ├── AuctionItem.ts
│   │   ├── Bid.ts
│   │   ├── Transaction.ts
│   │   └── ...
│   │
│   ├── routes/          # API route definitions
│   │   ├── authRoutes.ts
│   │   ├── auctionRoutes.ts
│   │   └── ...
│   │
│   ├── services/        # Business logic (core functionality)
│   │   ├── auctionService.ts
│   │   ├── bidService.ts
│   │   ├── walletService.ts
│   │   └── ...
│   │
│   └── utils/           # Helper functions
│       ├── jwt.ts
│       ├── slug.ts
│       └── errors.ts
│
└── uploads/             # User-uploaded images
```

**Key Concepts:**
- **Controllers**: Handle HTTP requests, call services, return responses
- **Services**: Contain business logic (what the app actually does)
- **Models**: Define database structure and validation
- **Middleware**: Process requests before they reach controllers (auth, validation)

### Frontend Structure

```
frontend/
├── src/
│   ├── app/             # Next.js pages (App Router)
│   │   ├── page.tsx     # Home page
│   │   ├── auctions/[id]/page.tsx
│   │   ├── dashboard/buyer/page.tsx
│   │   └── ...
│   │
│   ├── components/      # React components
│   │   ├── auctions/    # Auction-related components
│   │   ├── forms/      # Form components
│   │   ├── dashboard/  # Dashboard components
│   │   └── ...
│   │
│   ├── context/         # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── SocketContext.tsx
│   │
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuctionSubscription.ts
│   │   └── useCountdown.ts
│   │
│   ├── lib/             # Utilities and API client
│   │   ├── api.ts       # API functions
│   │   ├── swr.ts       # SWR hooks
│   │   └── types.ts     # TypeScript types
│   │
│   └── utils/           # Helper functions
│
└── public/              # Static assets
```

**Key Concepts:**
- **App Router**: Next.js 13+ routing system (file-based routing)
- **Components**: Reusable UI pieces
- **Context**: Global state management (auth, socket)
- **Hooks**: Reusable logic (custom hooks for common patterns)

---

## 4. Core Features Explained

### 4.1 Authentication System

**How it works:**
1. User registers → Password hashed with bcrypt → User saved to database
2. User logs in → Password verified → JWT token generated
3. Token stored in HTTP-only cookie (secure, can't be accessed by JavaScript)
4. Every protected request includes token → Middleware verifies → Grants access

**Files:**
- `backend/src/controllers/authController.ts` - Registration/login logic
- `backend/src/middleware/auth.ts` - Token verification middleware
- `frontend/src/context/AuthContext.tsx` - Frontend auth state

**Key Security Features:**
- Passwords hashed with bcrypt (one-way encryption)
- JWT tokens expire after set time
- HTTP-only cookies prevent XSS attacks
- Role-based access control (buyer, seller, admin)

### 4.2 Auction Management

**Auction Lifecycle:**
```
Pending → Live → Completed
   ↓        ↓        ↓
Scheduled  Active  Ended
```

**Auction States:**
- **Pending**: Created but not started yet
- **Live**: Currently accepting bids
- **Completed**: Ended, winner determined
- **Cancelled**: Seller cancelled before completion

**Key Features:**
- **Scheduled Start/End**: Auctions automatically transition using `AuctionScheduler`
- **Multiple Images**: Sellers can upload multiple images with drag-and-drop reordering
- **Categories**: 11 predefined categories (Art, Electronics, Vehicles, etc.)
- **SEO-Friendly URLs**: Slugs like `vintage-watch-123abc` instead of just IDs
- **Edit Restrictions**: Some fields can't be edited after bidding starts

**Files:**
- `backend/src/services/auctionService.ts` - Auction CRUD operations
- `backend/src/services/auctionScheduler.ts` - Automatic state transitions
- `frontend/src/components/forms/CreateAuctionForm.tsx` - Auction creation UI

### 4.3 Real-time Bidding

**How Bidding Works:**
1. User enters bid amount → Frontend validates minimum increment
2. API call to `/api/auctions/:id/bids` → Backend validates:
   - Auction is live
   - Bid is high enough (currentPrice + minimumIncrement)
   - User has sufficient wallet balance
   - User isn't the seller
3. Funds blocked in wallet → Bid saved → Previous bidder's funds released
4. Socket.io emits `bid:new` event → All connected clients update in real-time

**Real-time Updates:**
- New bids appear instantly for all users
- Countdown timer syncs with server time
- Current price updates automatically
- "You are leading" indicator shows for highest bidder

**Files:**
- `backend/src/services/bidService.ts` - Bid placement logic
- `frontend/src/components/forms/BidForm.tsx` - Bid input form
- `frontend/src/hooks/useAuctionSubscription.ts` - Real-time subscription

### 4.4 Auto-Bidding System

**How Auto-Bid Works:**
1. User sets maximum bid (e.g., $100)
2. System automatically bids incrementally up to maximum
3. When someone bids $50, auto-bid bids $51 (or minimum increment)
4. Continues until maximum is reached or auction ends

**Smart Features:**
- Only one auto-bid per user per auction
- Processes competing auto-bids intelligently
- Prevents infinite loops with depth limits
- Shows status: "Active" or "Maximum Exceeded"

**Example Scenario:**
- User A sets auto-bid max: $100
- User B bids $60 → Auto-bid bids $61
- User B bids $80 → Auto-bid bids $81
- User B bids $100 → Auto-bid can't go higher, status: "Exceeded"

**Files:**
- `backend/src/services/autoBidService.ts` - Auto-bid processing logic
- `frontend/src/components/forms/AutoBidForm.tsx` - Auto-bid setup UI

### 4.5 Wallet System

**Three Balance Types:**
1. **Wallet Balance**: Total money in account
2. **Blocked Balance**: Money reserved for active bids
3. **Available Balance**: Money you can use (walletBalance - blockedBalance)

**Fund Flow:**
```
Add Funds → Wallet Balance increases
Place Bid → Blocked Balance increases, Available decreases
Outbid → Blocked Balance decreases, Available increases
Win Auction → Wallet Balance decreases (money paid), Blocked decreases
```

**Incremental Blocking:**
- If you bid $50, then bid $70, only $20 more is blocked (not $70)
- Previous $50 is already blocked, so only difference is added

**Transaction Types:**
- `deposit`: Adding money to wallet
- `bid_block`: Money blocked for a bid
- `bid_release`: Money released when outbid
- `bid_capture`: Money deducted when you win

**Files:**
- `backend/src/services/walletService.ts` - All wallet operations
- `frontend/src/app/wallet/page.tsx` - Wallet UI

### 4.6 Dashboard & Analytics

**Seller Dashboard Shows:**
- All auctions created
- Current highest bid for each
- Total revenue
- Average sale price
- Success rate (completed vs cancelled)
- Revenue timeline (last 30 days)

**Buyer Dashboard Shows:**
- Active bids (auctions you're bidding on)
- Won auctions
- Total bids placed
- Total spent
- Win rate
- Favorite categories
- Bidding timeline

**How Analytics Work:**
- MongoDB aggregation pipelines calculate statistics
- Recharts library creates visual charts
- Real-time updates via Socket.io

**Files:**
- `backend/src/services/auctionService.ts` - Dashboard data aggregation
- `frontend/src/components/dashboard/SellerDashboard.tsx`
- `frontend/src/components/dashboard/BuyerDashboard.tsx`

### 4.7 Watchlist

**Features:**
- Save auctions to watchlist
- Quick access to favorite auctions
- Real-time updates for watched auctions
- Badge indicators on auction cards

**Implementation:**
- Separate `Watchlist` model stores user-auction pairs
- One-to-many relationship (user can watch many auctions)
- Quick check endpoint to see if auction is watched

**Files:**
- `backend/src/models/Watchlist.ts`
- `frontend/src/components/watchlist/WatchlistButton.tsx`

### 4.8 Notifications

**Notification Types:**
- `bid_received`: Someone bid on your auction
- `bid_outbid`: You were outbid
- `bid_won`: You won an auction
- `auction_live`: Your auction went live
- `auction_completed`: Auction ended

**Delivery:**
- Stored in database for persistence
- Sent via Socket.io for real-time delivery
- User-specific rooms (`user:${userId}`) for targeted delivery

**Files:**
- `backend/src/services/notificationService.ts`
- `frontend/src/components/notifications/NotificationList.tsx`

---

## 5. Database Models & Relationships

### User Model

```typescript
{
  username: string (unique, required)
  email: string (unique, required)
  password: string (hashed with bcrypt)
  role: "buyer" | "seller" | "admin"
  avatarUrl?: string
  walletBalance: number (default: 0)
  blockedBalance: number (default: 0)
  createdAt, updatedAt (timestamps)
}
```

**Relationships:**
- One-to-many with `AuctionItem` (seller)
- One-to-many with `Bid` (bidder)
- One-to-many with `Transaction` (user)
- One-to-many with `Watchlist` (user)

### AuctionItem Model

```typescript
{
  title: string
  slug: string (unique, SEO-friendly)
  description: string
  category: enum (11 categories)
  startingPrice: number
  minimumIncrement: number
  currentPrice: number
  currentBidder?: ObjectId (ref: User)
  seller: ObjectId (ref: User, required)
  status: "pending" | "live" | "completed" | "cancelled"
  startTime: Date
  endTime: Date
  imageUrls: string[]
  createdAt, updatedAt
}
```

**Relationships:**
- Many-to-one with `User` (seller)
- Many-to-one with `User` (currentBidder)
- One-to-many with `Bid` (auction)
- One-to-many with `Watchlist` (auction)

**Indexes:**
- `{ status: 1, endTime: 1 }` - For finding live/ending auctions
- `{ status: 1, currentBidder: 1 }` - For wallet balance queries

### Bid Model

```typescript
{
  amount: number
  bidder: ObjectId (ref: User)
  auction: ObjectId (ref: AuctionItem)
  blockedAmount: number (funds blocked for this bid)
  createdAt, updatedAt
}
```

**Relationships:**
- Many-to-one with `User` (bidder)
- Many-to-one with `AuctionItem` (auction)

**Indexes:**
- `{ auction: 1, amount: -1 }` - For finding highest bid
- `{ bidder: 1, auction: 1, blockedAmount: 1 }` - For wallet queries

### Transaction Model

```typescript
{
  user: ObjectId (ref: User)
  type: "deposit" | "bid_block" | "bid_release" | "bid_capture" | "refund"
  amount: number
  description: string
  status: "completed" | "pending" | "failed"
  auction?: ObjectId (ref: AuctionItem)
  bid?: ObjectId (ref: Bid)
  createdAt, updatedAt
}
```

**Purpose:** Complete audit trail of all wallet transactions

### Other Models

- **AutoBid**: Stores maximum bid amounts for automatic bidding
- **Watchlist**: User-auction pairs for saved auctions
- **Notification**: User notifications with types and metadata
- **Rating**: User ratings and comments

---

## 6. API Endpoints & Routes

### Authentication Endpoints

```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user info
```

### Auction Endpoints

```
GET    /api/auctions                    - List auctions (with category filter)
GET    /api/auctions/:slug              - Get auction by slug/ID
POST   /api/auctions                    - Create auction (seller only)
PATCH  /api/auctions/:id                - Update auction (seller only)
POST   /api/auctions/:id/resolve        - Manually resolve auction (admin)
```

### Bidding Endpoints

```
POST   /api/auctions/:id/bids           - Place a bid
GET    /api/auctions/:id/bids           - Get bid history
```

### Auto-Bid Endpoints

```
POST   /api/auto-bids/:auctionId        - Create/update auto-bid
GET    /api/auto-bids/:auctionId        - Get auto-bid status
DELETE /api/auto-bids/:auctionId        - Remove auto-bid
```

### Wallet Endpoints

```
POST   /api/wallet/add-funds            - Add money to wallet
GET    /api/wallet/balance              - Get wallet balance
GET    /api/wallet/transactions         - Get transaction history
```

### Dashboard Endpoints

```
GET    /api/dashboard/seller            - Seller dashboard with analytics
GET    /api/dashboard/buyer             - Buyer dashboard with analytics
```

### Watchlist Endpoints

```
GET    /api/watchlist                  - Get user watchlist
POST   /api/watchlist/:auctionId       - Add to watchlist
DELETE /api/watchlist/:auctionId       - Remove from watchlist
GET    /api/watchlist/:auctionId/check - Check if auction is watched
```

### Other Endpoints

```
POST   /api/upload/images              - Upload multiple images
GET    /api/users/:id                   - Get user profile
POST   /api/users/:id/rating            - Rate a user
GET    /api/notifications               - Get user notifications
PATCH  /api/notifications/:id/read     - Mark notification as read
GET    /api/admin/overview              - Admin dashboard (admin only)
```

**Request/Response Flow:**
```
Client → Route → Middleware (auth) → Controller → Service → Database
                                                          ↓
Client ← Response ← Controller ← Service ← Database
```

---

## 7. Real-time Communication (Socket.io)

### What is Socket.io?

Socket.io enables **real-time, bidirectional communication** between client and server. Unlike HTTP (request-response), Socket.io maintains a persistent connection, allowing the server to push updates to clients instantly.

### Connection Setup

**Backend (`backend/src/config/socket.ts`):**
1. Socket.io server initialized with Express HTTP server
2. Authentication middleware verifies JWT token
3. Authenticated users automatically join `user:${userId}` room
4. Clients can join `auction:${auctionId}` rooms

**Frontend (`frontend/src/context/SocketContext.tsx`):**
1. Socket.io client connects to server
2. Token sent in handshake for authentication
3. Connection status tracked
4. Server time sync for accurate countdowns

### Socket Rooms

**What are rooms?**
Rooms are like channels. When you emit to a room, all clients in that room receive the message.

**Room Types:**
- `user:${userId}` - User-specific room (notifications, wallet updates)
- `auction:${auctionId}` - Auction-specific room (bid updates, status changes)

**Example:**
```javascript
// Server emits to auction room
io.to(`auction:123`).emit("bid:new", { amount: 100 });

// All clients in auction:123 room receive this
```

### Socket Events

#### Client → Server Events

| Event | Purpose |
|-------|---------|
| `joinAuction` | Join an auction room to receive updates |
| `leaveAuction` | Leave an auction room |

#### Server → Client Events

| Event | Purpose | Sent To |
|-------|---------|---------|
| `connection:ack` | Connection confirmed with server time | All clients |
| `server:time` | Periodic server time (every 15s) | All clients |
| `auction:time-sync` | Auction-specific time sync | Auction room |
| `auction:update` | Auction details changed | Auction room |
| `bid:new` | New bid placed | Auction room |
| `auction:finalized` | Auction ended | Auction room |
| `notification:new` | New notification | User room |
| `wallet:updated` | Wallet balance changed | User room |

### Real-time Features Using Socket.io

1. **Live Bidding**: New bids appear instantly for all users
2. **Countdown Timer**: Syncs with server time to prevent cheating
3. **Auction Status**: Updates when auction starts/ends
4. **Notifications**: Instant delivery to users
5. **Wallet Updates**: Balance changes pushed immediately
6. **Dashboard Updates**: Real-time refresh when auctions change

### How It Works in Practice

**Scenario: User A places a bid**

1. User A submits bid form → HTTP POST to `/api/auctions/:id/bids`
2. Backend processes bid → Updates database
3. Backend emits `bid:new` to `auction:${id}` room
4. All connected clients in that room receive event
5. Frontend updates UI automatically (price, bid feed, etc.)
6. If User B was outbid → Backend emits `wallet:updated` to `user:${userId}` room
7. User B's wallet UI updates automatically

**Files:**
- `backend/src/config/socket.ts` - Socket.io server setup
- `frontend/src/context/SocketContext.tsx` - Client connection
- `frontend/src/hooks/useAuctionSubscription.ts` - Auction event handling

---

## 8. Authentication & Security

### Authentication Flow

```
1. User Registration:
   User → POST /api/auth/register
   → Password hashed with bcrypt
   → User saved to database
   → JWT token generated
   → Token sent in HTTP-only cookie

2. User Login:
   User → POST /api/auth/login
   → Password verified with bcrypt
   → JWT token generated
   → Token sent in HTTP-only cookie

3. Protected Request:
   Client → Request with token (cookie or header)
   → authenticate middleware verifies token
   → User attached to req.user
   → Controller processes request
```

### JWT (JSON Web Tokens)

**What is JWT?**
A secure way to transmit information between parties. Contains:
- **Header**: Algorithm and token type
- **Payload**: User ID, expiration time
- **Signature**: Ensures token hasn't been tampered with

**Why JWT?**
- Stateless (server doesn't need to store sessions)
- Secure (signature prevents tampering)
- Portable (can be used across different services)

**Token Storage:**
- Stored in HTTP-only cookie (prevents JavaScript access, XSS protection)
- Also sent in Authorization header for API calls

### Password Security

**Hashing with bcrypt:**
- Passwords are **never** stored in plain text
- bcrypt creates a one-way hash (can't be reversed)
- Each password gets a unique salt (random data)
- Even same passwords produce different hashes

**Example:**
```
Password: "mypassword123"
Hashed: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
```

### Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Secure, signed tokens with expiration
3. **HTTP-only Cookies**: Prevents XSS attacks
4. **CORS Configuration**: Controls which origins can access API
5. **Input Validation**: All inputs validated and sanitized
6. **Role-Based Access**: Different permissions for buyer/seller/admin
7. **File Upload Validation**: Type and size restrictions
8. **Atomic Transactions**: Database operations are atomic (all or nothing)
9. **Wallet Validation**: Balance checked before bid placement
10. **Seller Protection**: Sellers can't bid on their own auctions

### Middleware Chain

```
Request → CORS → Cookie Parser → authenticate → requireRoles → Controller
```

**Example Protected Route:**
```typescript
router.post('/auctions', authenticate, requireRoles('seller'), createAuction);
// 1. authenticate: Verifies JWT, attaches user to req
// 2. requireRoles('seller'): Checks if user has seller role
// 3. createAuction: Controller handles request
```

**Files:**
- `backend/src/middleware/auth.ts` - Authentication middleware
- `backend/src/utils/jwt.ts` - JWT generation/verification
- `backend/src/controllers/authController.ts` - Login/register logic

---

## 9. Wallet System Deep Dive

### Wallet Architecture

The wallet system manages user funds throughout the auction lifecycle. It ensures:
- Users have sufficient funds before bidding
- Funds are properly blocked/reserved
- Winners pay when auction ends
- Losers get refunds automatically

### Three Balance Types

1. **walletBalance**: Total money in account
   - Increases when you add funds
   - Decreases when you win an auction

2. **blockedBalance**: Money reserved for active bids
   - Increases when you place a bid
   - Decreases when you're outbid or auction ends

3. **availableBalance**: Money you can actually use
   - Calculated as: `walletBalance - blockedBalance`
   - This is what's checked before placing bids

### Fund Flow Examples

#### Example 1: Simple Bidding Flow

```
Initial State:
- walletBalance: $100
- blockedBalance: $0
- availableBalance: $100

User places $50 bid:
- walletBalance: $100 (unchanged)
- blockedBalance: $50
- availableBalance: $50

User places $70 bid (higher bid):
- walletBalance: $100 (unchanged)
- blockedBalance: $70 (only $20 more blocked, not $70)
- availableBalance: $30

User is outbid:
- walletBalance: $100 (unchanged)
- blockedBalance: $0 (released)
- availableBalance: $100 (back to full)
```

#### Example 2: Winning an Auction

```
User wins auction at $70:
- walletBalance: $30 ($100 - $70)
- blockedBalance: $0 (released)
- availableBalance: $30
```

### Incremental Blocking

**Why incremental?**
If you bid $50, then bid $70, you don't need to block $70 total. You already have $50 blocked, so only $20 more needs to be blocked.

**Implementation:**
```typescript
// In walletService.ts
const previousBid = await Bid.findOne({ auction, bidder })
  .sort({ amount: -1 });
const previousBlocked = previousBid?.blockedAmount || 0;
const incrementalAmount = bidAmount - previousBlocked;

// Only block the difference
await User.findByIdAndUpdate(userId, {
  $inc: { blockedBalance: incrementalAmount }
});
```

### Transaction Types

Every wallet operation creates a transaction record:

1. **deposit**: Adding money
   - `amount`: Amount added
   - `description`: "Deposit of $X"

2. **bid_block**: Blocking funds for bid
   - `amount`: Amount blocked
   - `description`: "Blocked $X for bid of $Y"
   - `auction`: Reference to auction

3. **bid_release**: Releasing blocked funds
   - `amount`: Amount released
   - `description`: "Released $X - outbid on auction"
   - `auction`, `bid`: References

4. **bid_capture**: Deducting money for win
   - `amount`: Amount paid
   - `description`: "Won auction - $X captured"
   - `auction`, `bid`: References

### Atomic Transactions

**Why atomic?**
Prevents race conditions where two operations happen simultaneously and cause incorrect balances.

**How it works:**
MongoDB sessions ensure all operations in a transaction either all succeed or all fail.

**Example:**
```typescript
const session = await User.startSession();
session.startTransaction();

try {
  await User.findByIdAndUpdate(userId, 
    { $inc: { blockedBalance: amount } }, 
    { session }
  );
  await Transaction.create([{...}], { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```

### Balance Calculation

**Problem:** Stored `blockedBalance` might get out of sync with actual blocked amounts.

**Solution:** Recalculate from actual bids when needed.

**How it works:**
1. Find all bids with `blockedAmount > 0` for user
2. Filter to only live auctions where user is `currentBidder`
3. Sum the `blockedAmount` values
4. Update stored `blockedBalance` if different

**Query:**
```typescript
// MongoDB aggregation pipeline
const result = await Bid.aggregate([
  { $match: { bidder: userId, blockedAmount: { $gt: 0 } } },
  { $lookup: { from: "auctionitems", ... } },
  { $match: { "auction.status": "live", "auction.currentBidder": userId } },
  { $group: { _id: null, totalBlocked: { $sum: "$blockedAmount" } } }
]);
```

### When Funds Are Released

**Immediately when outbid:**
- User A bids $50 → Funds blocked
- User B bids $60 → User A's funds released immediately
- User A can use that money for other auctions

**When auction ends:**
- Winner's funds are captured (deducted)
- All other bidders' funds are released
- Real-time wallet updates sent to all affected users

**Files:**
- `backend/src/services/walletService.ts` - All wallet operations
- `backend/src/models/Transaction.ts` - Transaction model
- `frontend/src/app/wallet/page.tsx` - Wallet UI

---

## 10. Frontend Architecture

### Next.js App Router

**What is App Router?**
Next.js 13+ file-based routing system. Files in `app/` directory automatically become routes.

**Example:**
```
app/
├── page.tsx              → / (home page)
├── auctions/
│   └── [id]/
│       └── page.tsx      → /auctions/:id (dynamic route)
└── dashboard/
    ├── page.tsx          → /dashboard
    └── buyer/
        └── page.tsx      → /dashboard/buyer
```

### React Context

**What is Context?**
Global state management without prop drilling. Used for:
- **AuthContext**: Current user, login/logout functions
- **SocketContext**: Socket connection, join/leave functions

**How it works:**
```typescript
// Provider wraps app
<AuthContext.Provider value={{ user, login, logout }}>
  {children}
</AuthContext.Provider>

// Components access via hook
const { user } = useAuth();
```

### Data Fetching with SWR

**What is SWR?**
"Stale-While-Revalidate" - a data fetching library that:
- Caches data
- Revalidates in background
- Deduplicates requests
- Provides loading/error states

**Example:**
```typescript
const { data, error, isLoading } = useSWR('/api/auctions', fetcher);
// Automatically refetches, caches, handles errors
```

**Benefits:**
- No manual loading states needed
- Automatic revalidation
- Request deduplication (multiple components can use same data)

### Component Structure

**Page Components:**
- Located in `app/` directory
- Handle routing and data fetching
- Pass data to presentational components

**Presentational Components:**
- Located in `components/` directory
- Reusable UI pieces
- Receive data via props

**Example:**
```typescript
// app/auctions/[id]/page.tsx (Page Component)
export default function AuctionPage() {
  const { data } = useSWR(`/api/auctions/${id}`);
  return <AuctionDetails auction={data} />;
}

// components/auctions/AuctionCard.tsx (Presentational)
export function AuctionCard({ auction }) {
  return <div>{auction.title}</div>;
}
```

### Real-time Updates

**How components stay updated:**
1. Component mounts → Subscribes to Socket.io events
2. Server emits event → Component receives it
3. Component updates state → UI re-renders
4. Component unmounts → Unsubscribes from events

**Example:**
```typescript
useEffect(() => {
  if (!socket) return;
  
  const handleBid = (data) => {
    setBids(prev => [data.bid, ...prev]);
  };
  
  socket.on('bid:new', handleBid);
  
  return () => {
    socket.off('bid:new', handleBid);
  };
}, [socket]);
```

### Styling with TailwindCSS

**What is TailwindCSS?**
Utility-first CSS framework. Instead of writing custom CSS, you use utility classes.

**Example:**
```tsx
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Button
</div>
// Instead of writing CSS file
```

**Benefits:**
- Fast development
- Consistent design
- Small bundle size (unused classes removed)

### Performance Optimizations

1. **Route Prefetching**: Next.js prefetches linked pages on hover
2. **Image Optimization**: Next.js Image component optimizes images
3. **Code Splitting**: Automatic code splitting per route
4. **SWR Caching**: Reduces unnecessary API calls
5. **Component Memoization**: Prevents unnecessary re-renders

---

## 11. Common Interview Questions & Answers

### Q1: "Tell me about this project."

**Answer:**
"BidFlow is a real-time auction platform I built using Next.js and Express. It allows users to create and participate in live auctions with real-time bidding, automatic fund management, and comprehensive dashboards. The platform uses Socket.io for instant updates, MongoDB for data storage, and includes features like auto-bidding, wallet management, and watchlists. I implemented a secure authentication system with JWT tokens and built a wallet system that automatically blocks and releases funds based on bidding activity."

### Q2: "Why did you choose these technologies?"

**Answer:**
- **Next.js**: For server-side rendering (SEO), automatic code splitting, and built-in routing. The App Router provides excellent developer experience.
- **Express**: Lightweight, flexible, and widely used. Perfect for REST APIs.
- **MongoDB**: Flexible schema works well for auction data with varying structures. Mongoose provides validation and type safety.
- **Socket.io**: Handles WebSocket connections with automatic fallback to polling, perfect for real-time updates.
- **TypeScript**: Catches errors at compile time, provides better IDE support, and makes code more maintainable.
- **SWR**: Automatic caching and revalidation reduces API calls and improves performance.

### Q3: "How does the real-time bidding work?"

**Answer:**
"When a user places a bid, the frontend sends an HTTP POST request to the backend. The backend validates the bid, blocks funds in the wallet, and saves the bid to the database. Then, using Socket.io, the backend emits a 'bid:new' event to the auction's room. All clients connected to that auction room receive the event instantly and update their UI. The system also handles outbid notifications by emitting 'wallet:updated' events to specific user rooms. This ensures all users see bids in real-time without refreshing the page."

### Q4: "Explain the wallet system."

**Answer:**
"The wallet system manages three balances: total wallet balance, blocked balance, and available balance. When a user places a bid, funds are blocked incrementally - if they bid $50 then $70, only $20 more is blocked. When a user is outbid, their funds are released immediately so they can use them elsewhere. When an auction ends, the winner's funds are captured (deducted), and all other bidders' funds are released. All operations use MongoDB transactions to ensure atomicity and prevent race conditions. Every operation creates a transaction record for audit purposes."

### Q5: "How do you handle authentication and security?"

**Answer:**
"Authentication uses JWT tokens stored in HTTP-only cookies, which prevents XSS attacks. Passwords are hashed with bcrypt before storage. The authenticate middleware verifies tokens on protected routes. Role-based access control ensures users can only access appropriate endpoints. For security, I validate all inputs, use atomic database transactions for wallet operations, prevent sellers from bidding on their own auctions, and validate wallet balances before bid placement. CORS is configured to restrict API access to allowed origins."

### Q6: "What challenges did you face and how did you solve them?"

**Answer:**
"One challenge was keeping wallet balances synchronized. The stored blockedBalance could get out of sync with actual blocked amounts. I solved this by implementing a recalculation system using MongoDB aggregation pipelines that queries actual bids and recalculates the balance when needed.

Another challenge was handling real-time updates efficiently. I used Socket.io rooms to broadcast events only to relevant users, reducing unnecessary network traffic.

For the auto-bidding system, preventing infinite loops was important. I implemented depth limits and recursive processing that stops when maximum bids are reached or when no more auto-bids can be processed."

### Q7: "How does the auto-bidding system work?"

**Answer:**
"Users set a maximum bid amount. When someone else bids, the system automatically places a bid one increment higher, up to the maximum. The system processes competing auto-bids intelligently - if multiple users have auto-bids, it processes them in order until one reaches their maximum. The system includes depth limits to prevent infinite loops and shows users when their maximum has been exceeded. Only one auto-bid per user per auction is allowed."

### Q8: "Explain the database schema and relationships."

**Answer:**
"The main models are User, AuctionItem, Bid, Transaction, and Watchlist. Users have one-to-many relationships with auctions (as sellers), bids (as bidders), and transactions. AuctionItems reference a seller and currentBidder (both Users), and have one-to-many relationships with Bids. Bids reference both a User (bidder) and AuctionItem. Transactions track all wallet operations and reference Users, Auctions, and Bids. I used MongoDB indexes on frequently queried fields like auction status, currentBidder, and bid amounts for performance."

### Q9: "How do you ensure data consistency in the wallet system?"

**Answer:**
"I use MongoDB sessions and transactions to ensure atomicity. When blocking funds, I start a transaction, update the user's blockedBalance, create a transaction record, and commit everything together. If any step fails, the entire transaction is rolled back. This prevents scenarios where funds are blocked but no record is created, or vice versa. I also implemented balance recalculation using aggregation pipelines to catch any inconsistencies and sync the stored balance with actual blocked amounts."

### Q10: "What performance optimizations did you implement?"

**Answer:**
"On the frontend, I used SWR for data fetching which provides automatic caching and request deduplication. Next.js handles code splitting and image optimization automatically. I implemented route prefetching for faster navigation.

On the backend, I used MongoDB aggregation pipelines for complex queries instead of multiple database calls. I added indexes on frequently queried fields. For wallet balance calculations, I use efficient aggregation queries that calculate everything in a single database operation.

For Socket.io, I use rooms to broadcast events only to relevant users, reducing unnecessary network traffic."

### Q11: "How does the auction scheduler work?"

**Answer:**
"The AuctionScheduler class manages automatic state transitions for auctions. On server startup, it loads all pending and live auctions and schedules timers for their start and end times. When an auction's start time arrives, it automatically transitions from 'pending' to 'live'. When the end time arrives, it calls finalizeAuction which determines the winner, captures their payment, releases other bidders' funds, and marks the auction as 'completed'. The scheduler also handles cleanup when auctions are cancelled or manually resolved."

### Q12: "What is the difference between blockedBalance and walletBalance?"

**Answer:**
"walletBalance is the total amount of money in a user's account. blockedBalance is the portion of that money that's currently reserved for active bids. availableBalance (calculated as walletBalance - blockedBalance) is what the user can actually spend. When you place a bid, money moves from available to blocked. When you're outbid, it moves back to available. When you win, it's deducted from walletBalance entirely."

### Q13: "How do you handle errors in the application?"

**Answer:**
"I use a centralized error handler middleware that catches all errors. Custom error classes (NotFoundError, UnauthorizedError, etc.) provide specific error types. The error handler formats errors consistently and sends appropriate HTTP status codes. On the frontend, SWR handles API errors automatically, and I use try-catch blocks for critical operations. I also validate inputs on both frontend and backend to catch errors early."

### Q14: "Explain the Socket.io room system."

**Answer:**
"Rooms are like channels for organizing Socket.io connections. When a user connects, they're automatically added to a user-specific room (`user:${userId}`) for personal notifications. Users can join auction rooms (`auction:${auctionId}`) to receive bid updates. When the server emits an event to a room, all clients in that room receive it. This is more efficient than broadcasting to all clients or maintaining individual connections. For example, when a bid is placed, I emit to the auction room so only users watching that auction get the update."

### Q15: "What would you improve if you had more time?"

**Answer:**
"I would add pagination for auction listings and bid history to handle large datasets better. I'd implement Redis caching for frequently accessed data like auction lists. For scalability, I'd add horizontal scaling support for Socket.io using Redis adapter. I'd also add comprehensive unit and integration tests. For the wallet system, I'd implement a more sophisticated fraud detection system. I'd also add email notifications in addition to in-app notifications, and implement a payment gateway integration for real money transactions."

---

## Quick Reference

### Key Files to Know

**Backend:**
- `backend/src/services/bidService.ts` - Bid placement logic
- `backend/src/services/walletService.ts` - Wallet operations
- `backend/src/services/auctionService.ts` - Auction management
- `backend/src/config/socket.ts` - Socket.io setup
- `backend/src/middleware/auth.ts` - Authentication

**Frontend:**
- `frontend/src/context/SocketContext.tsx` - Socket connection
- `frontend/src/context/AuthContext.tsx` - Authentication state
- `frontend/src/hooks/useAuctionSubscription.ts` - Real-time updates
- `frontend/src/lib/api.ts` - API functions
- `frontend/src/lib/swr.ts` - Data fetching hooks

### Key Concepts to Remember

1. **Real-time updates** use Socket.io rooms for efficient broadcasting
2. **Wallet system** uses incremental blocking and immediate release on outbid
3. **Authentication** uses JWT tokens in HTTP-only cookies
4. **Database operations** use transactions for atomicity
5. **Performance** optimized with indexes, aggregation, and caching

---

## Conclusion

This guide covers all major aspects of the BidFlow project. Remember:
- **Understand the flow**: User actions → API calls → Database → Socket events → UI updates
- **Know the technologies**: Why each was chosen and how they work together
- **Explain clearly**: Use simple language, give examples, show you understand the "why" not just the "what"

Good luck with your interview! 🚀

