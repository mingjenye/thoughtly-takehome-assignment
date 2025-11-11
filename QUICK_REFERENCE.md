# Quick Reference Guide

## 🚀 Quick Start (After Initial Setup)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Visit: `http://localhost:3000`

## 📝 Essential Commands

### Backend Commands
```bash
cd backend

# Development
npm run dev              # Start dev server with hot reload
npm run build           # Compile TypeScript
npm start               # Start production server
npm run lint            # Run linter

# Database
psql -U postgres -d takehome_db -f ../database/migrations/001_create_users_table.sql
psql -U postgres -d takehome_db -f ../database/migrations/002_create_items_table.sql
psql -U postgres -d takehome_db -f ../database/seeds/001_seed_data.sql
```

### Frontend Commands
```bash
cd frontend

# Development
npm run dev             # Start dev server
npm start               # Alternative start command
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run linter
```

### Root Commands
```bash
# From project root
npm run dev             # Run both frontend & backend
npm run install:all     # Install all dependencies
npm run build           # Build both projects
```

## 🗄️ Database Quick Commands

```bash
# Connect to database
psql -U postgres -d takehome_db

# List all tables
\dt

# View table structure
\d users
\d items

# View all users
SELECT * FROM users;

# View all items
SELECT * FROM items;

# Reset database (CAREFUL!)
DROP TABLE items CASCADE;
DROP TABLE users CASCADE;
# Then re-run migrations

# Quit psql
\q
```

## 📡 API Endpoints

Base URL: `http://localhost:3001/api/v1`

### Authentication
```bash
# Register
POST /auth/register
Body: { "email": "user@example.com", "password": "password123", "name": "User" }

# Login
POST /auth/login
Body: { "email": "user@example.com", "password": "password123" }

# Logout
POST /auth/logout
```

### Items (Requires Auth Token)
```bash
# Get all items
GET /items
Header: Authorization: Bearer <token>

# Get single item
GET /items/:id
Header: Authorization: Bearer <token>

# Create item
POST /items
Header: Authorization: Bearer <token>
Body: { "title": "Item Title", "description": "Description", "status": "pending" }

# Update item
PUT /items/:id
Header: Authorization: Bearer <token>
Body: { "title": "Updated Title", "status": "completed" }

# Delete item
DELETE /items/:id
Header: Authorization: Bearer <token>
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/takehome_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_APP_NAME=Take Home Exam
```

## 📁 Key File Locations

### Backend Structure
```
backend/src/
├── server.ts              # Entry point
├── app.ts                 # Express setup
├── controllers/           # HTTP handlers
├── services/              # Business logic
├── repositories/          # Database access
├── routes/                # API routes
├── middleware/            # Express middleware
└── validators/            # Request validation
```

### Frontend Structure
```
frontend/src/
├── index.tsx              # Entry point
├── App.tsx                # Main component
├── pages/                 # Page components
├── components/            # Reusable components
├── contexts/              # Global state
├── services/              # API calls
└── types/                 # TypeScript types
```

## 🐛 Common Issues

### Backend won't start
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env
- Check port 3001 is available

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check VITE_API_URL in frontend/.env
- Verify CORS is enabled (check backend console)

### Database connection failed
- PostgreSQL not running
- Wrong credentials in DATABASE_URL
- Database doesn't exist: `createdb takehome_db`

### TypeScript errors
- Delete node_modules: `rm -rf node_modules && npm install`
- Rebuild: `npm run build`

## 🧪 Testing with curl

### Complete Flow
```bash
# 1. Register
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test"}'

# Copy token from response

# 2. Create Item
curl -X POST http://localhost:3001/api/v1/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"My First Item","description":"Test item","status":"pending"}'

# 3. Get All Items
curl http://localhost:3001/api/v1/items \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📦 Project Files Count

- **Backend**: 24 TypeScript files
- **Frontend**: 16 TypeScript/TSX files  
- **Database**: 3 SQL files
- **Total**: 50+ project files

## 🎯 Next Steps

1. ✅ Complete initial setup
2. ✅ Test all features
3. 📝 Customize for your requirements
4. 🎨 Improve UI/UX
5. 🧪 Add tests
6. 📚 Document your changes
7. 🚀 Deploy (if required)

## 📞 Need Help?

- Check `SETUP_GUIDE.md` for detailed setup
- Check `backend/README.md` for backend details
- Check `frontend/README.md` for frontend details
- Check `README.md` for project overview

---

**Pro Tip**: Keep this file open in a separate window while developing! 💡
