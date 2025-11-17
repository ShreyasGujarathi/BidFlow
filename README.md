# BidFlow

A modern, real-time auction platform built with Next.js, Express, MongoDB, and Socket.io. Features live bidding, user dashboards, watchlists, and comprehensive auction management.

## 🚀 Features

- **Real-time Bidding**: Live auction updates via WebSocket connections
- **User Dashboards**: Separate buyer and seller dashboards with analytics
- **Watchlist**: Save and track favorite auctions
- **Auto-bidding**: Set maximum bids for automatic bidding
- **Image Upload**: Multi-image support for auction listings
- **Theme Support**: Light and dark mode with smooth transitions
- **Responsive Design**: Mobile-first, modern UI with glassmorphism effects
- **Performance Optimized**: SWR caching, route prefetching, and image optimization

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or cloud)
- Git

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "BidFlow"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env.local` file in the `frontend` directory (optional):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## 📁 Project Structure

```
BidFlow/
├── backend/
│   ├── src/
│   │   ├── config/       # Database, environment, socket config
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Auth, error handling
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Helper functions
│   └── uploads/          # User-uploaded images
│
└── frontend/
    ├── src/
    │   ├── app/          # Next.js app router pages
    │   ├── components/    # React components
    │   ├── context/      # React contexts (Auth, Socket)
    │   ├── lib/          # Utilities and API client
    │   └── hooks/        # Custom React hooks
    └── public/           # Static assets
```

## 🔑 Key Technologies

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, SWR
- **Backend**: Express.js, TypeScript, MongoDB (Mongoose), Socket.io
- **Authentication**: JWT tokens with secure cookie handling
- **Real-time**: Socket.io for live auction updates
- **Image Handling**: Multer for uploads, Next.js Image optimization

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Auctions
- `GET /api/auctions` - List all auctions (with optional category filter)
- `GET /api/auctions/:id` - Get auction details
- `POST /api/auctions` - Create new auction (seller only)
- `PUT /api/auctions/:id` - Update auction (seller only)

### Bidding
- `POST /api/auctions/:id/bids` - Place a bid
- `GET /api/auctions/:id/bids` - Get bid history
- `POST /api/auctions/:id/auto-bid` - Set auto-bid

### Dashboard
- `GET /api/dashboard/buyer` - Buyer dashboard data
- `GET /api/dashboard/seller` - Seller dashboard data

### Watchlist
- `GET /api/watchlist` - Get user watchlist
- `POST /api/watchlist/:auctionId` - Add to watchlist
- `DELETE /api/watchlist/:auctionId` - Remove from watchlist

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- File upload restrictions
- Protected routes and API endpoints

## 🎨 UI/UX Features

- Glassmorphism design with navy blue theme
- Smooth theme transitions (light/dark mode)
- Loading states and skeleton screens
- Optimistic UI updates
- Responsive navigation with mobile menu
- Route prefetching for instant navigation

## 🐛 Troubleshooting

### Port Already in Use
If port 5000 or 3000 is already in use:
- Backend: Change `PORT` in `.env`
- Frontend: Change port in `package.json` scripts or use `PORT=3001 npm run dev`

### MongoDB Connection Issues
- Verify your `MONGODB_URI` in `.env`
- Ensure MongoDB is running
- Check network/firewall settings

### Image Upload Issues
- Ensure `backend/uploads/` directory exists
- Check file size limits in multer config
- Verify file type restrictions

## 📄 License

This project is private and proprietary.

## 👥 Contributing

This is a private project. For issues or suggestions, please contact the project maintainer.

## 📧 Support

For support, please open an issue in the repository or contact the development team.

