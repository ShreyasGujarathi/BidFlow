# BidFlow - Features Documentation

A comprehensive real-time auction platform built with Next.js, Node.js, Express, MongoDB, and Socket.IO.

## Table of Contents
- [Core Technologies](#core-technologies)
- [Authentication & User Management](#authentication--user-management)
- [Auction Management](#auction-management)
- [Real-time Bidding System](#real-time-bidding-system)
- [Auto-Bidding System](#auto-bidding-system)
- [Wallet System](#wallet-system)
- [Dashboard & Analytics](#dashboard--analytics)
- [Watchlist & Favorites](#watchlist--favorites)
- [Image Management](#image-management)
- [User Profiles & Ratings](#user-profiles--ratings)
- [Notifications](#notifications)
- [Admin Panel](#admin-panel)
- [UI/UX Design System](#uiux-design-system)
- [Performance Optimizations](#performance-optimizations)
- [SEO & URL Optimization](#seo--url-optimization)

---

## Core Technologies

### Backend Stack
- **Node.js (LTS)** - Runtime environment
- **Express 5.1.0** - Web framework
- **TypeScript 5.9.3** - Type safety and modern JavaScript features
- **MongoDB** - NoSQL database
- **Mongoose 8.19.3** - MongoDB object modeling
- **Socket.IO 4.8.1** - Real-time bidirectional communication
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer 2.0.2** - File upload handling
- **CORS** - Cross-origin resource sharing
- **Cookie Parser** - Cookie management

### Frontend Stack
- **Next.js 15.0.0-canary.13** - React framework with SSR/SSG
- **React 19.0.0-rc** - UI library
- **TypeScript 5.6.3** - Type safety
- **TailwindCSS 3.4.14** - Utility-first CSS framework
- **Socket.IO Client 4.8.1** - Real-time client communication
- **date-fns 3.6.0** - Date manipulation and formatting
- **Recharts 3.4.1** - Data visualization and charts
- **clsx** - Conditional className utility

---

## Authentication & User Management

### Features
- User registration with email and password
- Secure login with JWT tokens
- Password hashing with bcryptjs
- Token-based authentication
- Protected routes with middleware
- Unified account system (users can both buy and sell)

### Technologies Used
- **JWT (jsonwebtoken)** - Secure token generation and validation
- **bcryptjs** - Password hashing and verification
- **Express Middleware** - Route protection
- **Cookie Parser** - Token storage in HTTP-only cookies

### Implementation Files
- `backend/src/controllers/authController.ts`
- `backend/src/middleware/auth.ts`
- `backend/src/utils/jwt.ts`
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/components/forms/AuthForm.tsx`

---

## Auction Management

### Features
- Create auctions with detailed information
- Edit auction details (with restrictions based on bid status)
- Multiple image support with drag-and-drop reordering
- 11 auction categories: Art, Collectibles, Electronics, Vehicles, Jewelry, Antiques, Sports, Books, Home & Garden, Fashion, Toys & Games
- Starting price and minimum bid increment configuration
- Scheduled start and end times
- Auction status management (pending, live, completed, cancelled)
- Automatic auction state transitions
- SEO-friendly URLs with slugs

### Edit Restrictions
- **Always Editable**: Title, description, images
- **Only Editable Before Bidding**: Starting price, minimum increment
- Real-time validation and tooltip messages

### Technologies Used
- **Mongoose Models** - Data structure and validation
- **Express Routes** - RESTful API endpoints
- **Multer** - Image upload handling
- **Slug Generation** - URL-friendly identifiers
- **Auction Scheduler** - Automated state management

### Implementation Files
- `backend/src/models/AuctionItem.ts`
- `backend/src/controllers/auctionController.ts`
- `backend/src/services/auctionService.ts`
- `backend/src/services/auctionScheduler.ts`
- `backend/src/utils/slug.ts`
- `frontend/src/components/forms/CreateAuctionForm.tsx`
- `frontend/src/components/forms/ImageUploader.tsx`

---

## Real-time Bidding System

### Features
- Real-time bid updates via WebSockets
- Live countdown timer synchronized with server time
- Bid validation (minimum increment enforcement)
- Bid history tracking and display
- Leading bid indicator ("You are currently leading this auction")
- Outbid notifications
- Prevent sellers from bidding on their own auctions
- Automatic bid amount updates when price increases
- Manual bid editing with real-time validation

### Real-time Events
- `auction:update` - Auction details changed
- `bid:new` - New bid placed
- `auction:finalized` - Auction ended
- `server:time` - Server time synchronization

### Technologies Used
- **Socket.IO** - Real-time bidirectional communication
- **WebSocket Protocol** - Low-latency connections
- **Server Time Sync** - Client-server time offset calculation
- **React Hooks** - Real-time state management

### Implementation Files
- `backend/src/config/socket.ts`
- `backend/src/services/bidService.ts`
- `frontend/src/context/SocketContext.tsx`
- `frontend/src/hooks/useAuctionSubscription.ts`
- `frontend/src/components/forms/BidForm.tsx`
- `frontend/src/components/bids/BidFeed.tsx`
- `frontend/src/components/common/CountdownTimer.tsx`

---

## Auto-Bidding System

### Features
- Set maximum bid amount
- Automatic incremental bidding up to maximum
- Process competing auto-bids intelligently
- Real-time status updates (Active/Exceeded)
- Notification when maximum is exceeded
- One auto-bid per user per auction
- Recursive processing with depth limits to prevent infinite loops

### Technologies Used
- **Mongoose Models** - AutoBid data structure
- **Recursive Processing** - Intelligent bid handling
- **Socket.IO** - Real-time status updates
- **Service Layer** - Business logic separation

### Implementation Files
- `backend/src/models/AutoBid.ts`
- `backend/src/services/autoBidService.ts`
- `backend/src/controllers/autoBidController.ts`
- `frontend/src/components/forms/AutoBidForm.tsx`

---

## Wallet System

### Features
- **Wallet Balance Management**
  - Add funds to wallet
  - View available, total, and blocked balances
  - Real-time balance updates via WebSockets
  - Wallet balance displayed in navbar

- **Fund Blocking for Bids**
  - Automatic fund blocking when placing bids
  - Incremental blocking (only blocks the difference for new higher bids)
  - Funds automatically released when outbid
  - Only highest bidder's funds remain blocked
  - Balance validation before bid placement

- **Transaction History**
  - Complete audit trail of all wallet transactions
  - Transaction types: deposit, bid_block, bid_release, bid_capture, refund
  - Transaction status tracking
  - Detailed transaction descriptions
  - Chronological transaction list

- **Auction Resolution**
  - Automatic fund capture when auction ends
  - Winner's blocked amount deducted from wallet
  - Automatic release of funds for losing bidders
  - Real-time wallet updates for all affected users

- **Smart Balance Calculation**
  - Recalculates blocked balance from active bids only
  - Only counts funds for live auctions where user is highest bidder
  - Automatic synchronization of stored vs. calculated balance
  - Optimized aggregation queries for performance

### Technologies Used
- **Mongoose Aggregation** - Efficient balance calculation
- **MongoDB Transactions** - Atomic fund operations
- **Socket.IO** - Real-time wallet updates
- **SWR** - Client-side data fetching and caching
- **Database Indexes** - Optimized queries for wallet operations

### Implementation Files
- `backend/src/models/User.ts` (walletBalance, blockedBalance fields)
- `backend/src/models/Transaction.ts`
- `backend/src/models/Bid.ts` (blockedAmount field)
- `backend/src/services/walletService.ts`
- `backend/src/controllers/walletController.ts`
- `backend/src/routes/walletRoutes.ts`
- `frontend/src/components/wallet/WalletButton.tsx`
- `frontend/src/app/wallet/page.tsx`
- `frontend/src/lib/api.ts` (wallet API functions)
- `frontend/src/lib/swr.ts` (wallet hooks)

### Database Models
- **User**: `walletBalance`, `blockedBalance` fields
- **Transaction**: Complete transaction history with type, amount, status, references
- **Bid**: `blockedAmount` field to track funds blocked per bid

---

## Dashboard & Analytics

### Seller Dashboard Features
- List all created auctions
- View current highest bid for each auction (real-time)
- Bid count per auction
- Status breakdown (pending, live, completed, cancelled)
- Analytics:
  - Total revenue
  - Average sale price
  - Success rate (completed vs cancelled)
  - Revenue timeline (last 30 days)
- Visual charts with Recharts
- Real-time updates via WebSockets

### Buyer Dashboard Features
- Active bids (filtered to exclude completed auctions)
- Won auctions
- Analytics:
  - Total bids placed
  - Total spent
  - Average bid amount
  - Win rate
  - Auctions participated
  - Favorite categories
  - Bidding timeline (last 30 days)
  - Spending timeline (last 30 days)
- Visual charts with Recharts

### Technologies Used
- **Mongoose Aggregation** - Complex data queries
- **Recharts** - Data visualization
- **Socket.IO** - Real-time dashboard updates
- **React Components** - Interactive UI

### Implementation Files
- `backend/src/services/auctionService.ts` (getSellerDashboard, getBuyerDashboard)
- `backend/src/controllers/dashboardController.ts`
- `frontend/src/components/dashboard/SellerDashboard.tsx`
- `frontend/src/components/dashboard/SellerAnalytics.tsx`
- `frontend/src/components/dashboard/BuyerDashboard.tsx`
- `frontend/src/components/dashboard/BuyerAnalytics.tsx`

---

## Watchlist & Favorites

### Features
- Save auctions to watchlist
- Remove from watchlist
- View all watched auctions
- Check watchlist status
- Real-time watchlist updates
- Alert badges for watchlist items

### Technologies Used
- **Mongoose Models** - Watchlist data structure
- **Express Routes** - CRUD operations
- **React Context** - State management
- **Socket.IO** - Real-time updates

### Implementation Files
- `backend/src/models/Watchlist.ts`
- `backend/src/services/watchlistService.ts`
- `backend/src/controllers/watchlistController.ts`
- `frontend/src/components/watchlist/WatchlistButton.tsx`
- `frontend/src/components/watchlist/WatchedAuctions.tsx`
- `frontend/src/app/watchlist/page.tsx`

---

## Image Management

### Features
- Multiple image uploads
- Drag-and-drop image reordering
- Image preview before upload
- Image gallery viewer with lightbox
- Full-screen image view
- Keyboard navigation (arrow keys, escape)
- Image thumbnails
- Support for both file uploads and URL inputs
- Image optimization (Next.js Image component)
- Error handling for failed image loads

### Technologies Used
- **Multer** - File upload middleware
- **Next.js Image** - Optimized image rendering
- **File API** - Client-side file handling
- **FormData** - Multipart form submission

### Implementation Files
- `backend/src/middleware/upload.ts`
- `backend/src/controllers/uploadController.ts`
- `frontend/src/components/forms/ImageUploader.tsx`
- `frontend/src/components/common/ImageGallery.tsx`

---

## User Profiles & Ratings

### Features
- View user profiles
- User statistics:
  - Auctions created
  - Auctions won
  - Total bids placed
  - Average rating
  - Rating count
- Recent auctions created
- Recent wins
- Recent ratings received
- Rate other users (1-5 stars)
- Leave comments with ratings
- Clickable usernames linking to profiles
- Reputation system

### Technologies Used
- **Mongoose Models** - Rating data structure
- **Mongoose Aggregation** - Statistics calculation
- **Express Routes** - Profile endpoints
- **React Components** - Profile UI

### Implementation Files
- `backend/src/models/Rating.ts`
- `backend/src/services/userProfileService.ts`
- `backend/src/controllers/userProfileController.ts`
- `frontend/src/app/users/[id]/page.tsx`

---

## Notifications

### Features
- Real-time notifications via WebSockets
- Notification types:
  - `bid_received` - New bid on your auction
  - `bid_outbid` - You were outbid
  - `bid_won` - You won an auction
  - `auction_live` - Your auction went live
  - `auction_completed` - Auction ended
- Notification history
- Stored in database for persistence

### Technologies Used
- **Socket.IO** - Real-time notification delivery
- **Mongoose Models** - Notification storage
- **Service Layer** - Notification management

### Implementation Files
- `backend/src/models/Notification.ts`
- `backend/src/services/notificationService.ts`
- `backend/src/controllers/notificationController.ts`
- `frontend/src/components/notifications/NotificationList.tsx`

---

## Admin Panel

### Features
- Admin overview dashboard
- System statistics
- Auction monitoring
- User management
- Role-based access control

### Technologies Used
- **Express Middleware** - Role-based authorization
- **Mongoose Aggregation** - System-wide statistics

### Implementation Files
- `backend/src/controllers/adminController.ts`
- `backend/src/middleware/auth.ts` (requireRoles)
- `frontend/src/components/dashboard/AdminDashboard.tsx`
- `frontend/src/app/admin/page.tsx`

---

## UI/UX Design System

### Features
- **Navy Glass Aesthetic**
  - Glassmorphism design with blurred backgrounds
  - Gradient accents and soft shadows
  - Cohesive design language across all components

- **Dark & Light Theme Support**
  - Full theme toggle functionality
  - Theme-aware components and styling
  - CSS variables for dynamic theming
  - Persistent theme preference

- **Responsive Design**
  - Mobile-first approach
  - Adaptive layouts for all screen sizes
  - Touch-friendly interactions
  - Mobile drawer navigation

- **Component Library**
  - Consistent button styles with variants
  - Card components with hover effects
  - Badge components with gradients
  - Form inputs with proper styling
  - Loading states and skeletons

### Design Tokens
- Semantic color variables (background, foreground, card, border)
- Shadow system (soft, strong, glow)
- Gradient definitions (hero, primary, secondary)
- Spacing and typography scales

### Technologies Used
- **TailwindCSS** - Utility-first styling
- **CSS Variables** - Dynamic theming
- **Next.js Theme** - Theme management
- **clsx** - Conditional class names

### Implementation Files
- `frontend/src/app/globals.css` (design tokens)
- `frontend/tailwind.config.ts` (theme configuration)
- `frontend/src/components/ui/button.tsx`
- `frontend/src/components/ui/card.tsx`
- `frontend/src/components/ui/badge.tsx`
- `frontend/src/components/common/ThemeToggle.tsx`
- `frontend/src/components/navigation/NavBar.tsx`

---

## Performance Optimizations

### Features
- **Route Prefetching**
  - Automatic prefetching of frequently visited routes
  - Dashboard routes prefetched on app load
  - Wallet route prefetched for faster navigation
  - Reduces navigation latency significantly

- **Data Fetching Optimization**
  - SWR for client-side data fetching and caching
  - `keepPreviousData` for smooth transitions
  - Request deduplication to prevent duplicate API calls
  - Optimized refresh intervals

- **Backend Query Optimization**
  - MongoDB aggregation pipelines for complex queries
  - Database indexes on frequently queried fields
  - Single-query balance calculations
  - Efficient update operations (updateOne vs save)

- **Database Indexes**
  - Auction status and currentBidder index
  - Bid bidder, auction, and blockedAmount index
  - Optimized wallet balance queries

### Technologies Used
- **Next.js Route Prefetching** - Faster navigation
- **SWR** - Data fetching and caching
- **MongoDB Aggregation** - Efficient queries
- **Database Indexing** - Query performance

### Implementation Files
- `frontend/src/components/navigation/RoutePrefetcher.tsx`
- `frontend/src/lib/swr.ts` (optimized hooks)
- `backend/src/services/walletService.ts` (aggregation queries)
- `backend/src/models/AuctionItem.ts` (indexes)
- `backend/src/models/Bid.ts` (indexes)

---

## SEO & URL Optimization

### Features
- SEO-friendly URLs (slug-based)
- Format: `/auctions/[slug]-[id]`
- Automatic slug generation from titles
- Unique slug handling (appends numbers if duplicate)
- Backward compatibility with ID-only URLs

### Technologies Used
- **Slug Generation** - URL-friendly string conversion
- **Mongoose** - Unique constraint validation
- **Next.js Routing** - Dynamic routes

### Implementation Files
- `backend/src/utils/slug.ts`
- `frontend/src/utils/slug.ts`
- `backend/src/models/AuctionItem.ts` (slug field)
- `backend/src/services/auctionService.ts` (getAuctionBySlug)

---

## Additional Features

### Winner Congratulations Modal
- Automatic popup when user wins an auction
- Session storage to prevent repeated displays
- Shows auction details and winning amount

**Technologies**: React State, Session Storage, Socket.IO events

**Implementation**: `frontend/src/components/common/WinnerModal.tsx`

### Real-time Price Updates
- Automatic bid amount field updates when price increases
- Focus-aware updates (doesn't interfere with typing)
- Validation error clearing

**Technologies**: React useEffect, Focus tracking

**Implementation**: `frontend/src/components/forms/BidForm.tsx`

### Image Display Fixes
- Proper aspect ratio maintenance
- No cropping in full-screen view
- Responsive image sizing

**Technologies**: CSS object-contain, Flexbox

**Implementation**: `frontend/src/components/common/ImageGallery.tsx`

### Auction Card Enhancements
- Watchlist button on cards
- Clickable leading bidder username (links to profile)
- Seller view restrictions (can't bid on own items)
- Real-time status updates

**Technologies**: Socket.IO, Next.js Link, React Context

**Implementation**: `frontend/src/components/auctions/AuctionCard.tsx`

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Auctions
- `GET /api/auctions` - List live auctions (with category filter)
- `GET /api/auctions/:slug` - Get auction by slug/ID
- `POST /api/auctions` - Create auction
- `PATCH /api/auctions/:id` - Update auction
- `POST /api/auctions/:id/resolve` - Resolve auction and capture winner's payment

### Bidding
- `POST /api/auctions/:id/bids` - Place bid (with wallet balance validation)
- `GET /api/auctions/:id/bids` - Get bid history

### Auto-Bidding
- `POST /api/auto-bids/:auctionId` - Create/update auto-bid
- `GET /api/auto-bids/:auctionId` - Get auto-bid
- `DELETE /api/auto-bids/:auctionId` - Remove auto-bid

### Dashboards
- `GET /api/dashboard/seller` - Seller dashboard with analytics
- `GET /api/dashboard/buyer` - Buyer dashboard with analytics

### Watchlist
- `GET /api/watchlist` - Get user watchlist
- `POST /api/watchlist/:auctionId` - Add to watchlist
- `DELETE /api/watchlist/:auctionId` - Remove from watchlist
- `GET /api/watchlist/:auctionId/check` - Check watchlist status

### Uploads
- `POST /api/upload/images` - Upload multiple images

### Wallet
- `POST /api/wallet/add-funds` - Add funds to wallet
- `GET /api/wallet/balance` - Get wallet balance (available, total, blocked)
- `GET /api/wallet/transactions` - Get transaction history

### User Profiles
- `GET /api/users/:id` - Get user profile
- `POST /api/users/:id/rating` - Rate user

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark as read

### Admin
- `GET /api/admin/overview` - Admin overview

---

## Database Models

### User
- Authentication fields (username, email, password)
- Role (buyer, seller, admin)
- Avatar URL
- Wallet fields: `walletBalance`, `blockedBalance`
- Timestamps

### AuctionItem
- Title, slug, description
- Category (11 categories)
- Pricing (starting, current, minimum increment)
- Status (pending, live, completed, cancelled)
- Seller reference
- Current bidder reference
- Start/end times
- Image URLs array

### Bid
- Auction reference
- Bidder reference
- Amount
- Blocked amount (funds blocked for this bid)
- Timestamps

### Transaction
- User reference
- Type (deposit, bid_block, bid_release, bid_capture, refund)
- Amount
- Description
- Status (completed, pending, failed)
- Auction reference (optional)
- Bid reference (optional)
- Timestamps

### AutoBid
- Auction reference
- User reference
- Maximum bid amount
- Last bid amount
- Active status

### Watchlist
- User reference
- Auction reference
- Timestamps

### Notification
- User reference
- Type
- Message
- Metadata
- Read status
- Timestamps

### Rating
- Rater reference
- Rated user reference
- Rating (1-5)
- Comment (optional)
- Auction reference (optional)

---

## Real-time Socket Events

### Client → Server
- `joinAuction` - Join auction room
- `leaveAuction` - Leave auction room
- Authentication via `auth.token` in handshake

### Server → Client
- `connection:ack` - Connection acknowledgment with server time
- `server:time` - Periodic server time updates
- `auction:update` - Auction details updated
- `bid:new` - New bid placed (includes highest bid info)
- `auction:finalized` - Auction ended with winner info
- `notification:new` - New notification
- `wallet:updated` - Wallet balance updated (for outbid users and auction winners)
- `user:${userId}` - User-specific room for notifications

---

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- HTTP-only cookies for token storage
- CORS configuration
- Input validation and sanitization
- Role-based access control
- Seller bid prevention (can't bid on own auctions)
- Minimum bid validation
- File upload validation and type checking
- Wallet balance validation before bid placement
- Atomic transactions for fund operations (prevents race conditions)
- Incremental fund blocking (only blocks difference for new bids)

---

## Additional Performance Optimizations

- Next.js Image optimization
- MongoDB indexing on frequently queried fields
- Socket.IO room management (efficient event broadcasting)
- React component memoization where applicable
- Efficient aggregation pipelines for analytics
- Pagination-ready query structure
- Route prefetching for faster navigation
- SWR data caching and deduplication
- Optimized wallet balance queries with aggregation

---

## Development Tools

- **TypeScript** - Type safety across entire stack
- **Nodemon** - Auto-restart backend on changes
- **ESLint** - Code linting
- **PostCSS & Autoprefixer** - CSS processing
- **TailwindCSS** - Utility-first styling

---

## Project Structure

```
backend/
├── src/
│   ├── config/        # Database, Socket.IO, environment
│   ├── controllers/   # Route handlers
│   ├── middleware/    # Auth, error handling, upload
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API route definitions
│   ├── services/      # Business logic
│   └── utils/         # Helper functions

frontend/
├── src/
│   ├── app/           # Next.js pages and routing
│   ├── components/    # React components
│   ├── context/       # React Context providers
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # API client and types
│   └── utils/         # Helper functions
```

---

## Deployment Considerations

- Environment variables for configuration
- MongoDB connection string
- JWT secret and expiration
- CORS allowed origins
- File upload directory and size limits
- Socket.IO CORS configuration
- Next.js build optimization

---

---

## Recent Updates

### Wallet System (Latest)
- Complete wallet integration with fund management
- Real-time balance updates
- Transaction history tracking
- Automatic fund blocking and release
- Optimized balance calculation queries

### UI/UX Refresh
- Navy glass aesthetic design system
- Full dark/light theme support
- Responsive mobile-first design
- Consistent component library

### Performance Improvements
- Route prefetching implementation
- SWR optimization with caching
- Database query optimization
- Reduced navigation latency

---

*Last Updated: 2024*
*Version: 2.0.0*

