# Complete Setup Guide

This guide will walk you through setting up the complete full-stack application from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)
- A code editor (VS Code recommended)

## Step-by-Step Setup

### 1. PostgreSQL Database Setup

#### On macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Create database
createdb ticketbooking_db
```

#### On Windows
1. Download and install PostgreSQL from [official website](https://www.postgresql.org/download/windows/)
2. During installation, remember the password for the postgres user
3. Open pgAdmin or Command Prompt and create database:
```sql
CREATE DATABASE ticketbooking_db;
```

#### On Linux (Ubuntu/Debian)
```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql

# Switch to postgres user and create database
sudo -u postgres createdb ticketbooking_db
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

#### Edit backend/.env file:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ticketbooking_db
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

**Important**: Replace `your_password` with your actual PostgreSQL password!

#### Run database migrations:
```bash
# Option 1: Using psql (recommended)
psql -U postgres -d ticketbooking_db -f ../database/migrations/001_create_users_table.sql
psql -U postgres -d ticketbooking_db -f ../database/migrations/002_create_events_table.sql
psql -U postgres -d ticketbooking_db -f ../database/migrations/003_create_tickets_table.sql

# Option 2: If you have access via GUI (pgAdmin, TablePlus, etc.)
# Open each migration file and execute the SQL
```

#### (Optional) Seed the database:
```bash
psql -U postgres -d ticketbooking_db -f ../database/seeds/001_seed_data.sql
```

#### Start backend server:
```bash
npm run dev
```

You should see:
```
🚀 Server is running on port 3001
📝 Environment: development
🔗 API Base URL: http://localhost:3001/api/v1
✅ Database connected successfully
```

### 3. Frontend Setup

Open a **new terminal** (keep backend running):

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

The default .env should work:
```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_APP_NAME=Take Home Exam
```

#### Start frontend server:
```bash
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 4. Verify Everything Works

1. **Open browser**: Navigate to `http://localhost:3000`
2. **Register a new account**: Click "Register here" and create an account
3. **Login**: Use your new credentials to log in
4. **Test Items**: Create, edit, and delete items

### 5. Running Both Servers Concurrently (Optional)

From the **root directory**:

```bash
# Install root dependencies
npm install

# Run both frontend and backend together
npm run dev
```

This will start both servers in a single terminal.

## Testing the API Directly

### Using curl

#### Health Check
```bash
curl http://localhost:3001/health
```

#### Register
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the token from the response!

#### Get Items (requires token)
```bash
curl http://localhost:3001/api/v1/items \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman or Thunder Client

1. Import the API base URL: `http://localhost:3001/api/v1`
2. Test the endpoints as documented in the backend README

## Common Issues & Solutions

### Issue: Database connection failed
**Solution**: 
- Verify PostgreSQL is running: `pg_isready` or `brew services list`
- Check DATABASE_URL in .env has correct credentials
- Ensure database exists: `psql -U postgres -l`

### Issue: Port 3001 already in use
**Solution**: 
- Change PORT in backend/.env to another port (e.g., 5001)
- Update VITE_API_URL in frontend/.env accordingly

### Issue: CORS errors
**Solution**: 
- Verify FRONTEND_URL in backend/.env matches frontend port
- Check backend console for CORS configuration logs

### Issue: "Module not found" errors
**Solution**:
```bash
# In the directory with the error
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript errors
**Solution**:
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

### Issue: Cannot create database in PostgreSQL
**Solution**:
```bash
# On Unix-like systems, try:
sudo -u postgres psql
CREATE DATABASE takehome_db;
\q

# On Windows with psql:
psql -U postgres
# Enter password
CREATE DATABASE takehome_db;
\q
```

## Project Structure Overview

```
takehome-project/
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React Context
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript types
│   └── package.json
│
├── backend/                   # Node.js API
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── services/        # Business logic
│   │   ├── repositories/    # Data access
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   └── validators/      # Request validation
│   └── package.json
│
├── database/
│   ├── migrations/          # SQL migrations
│   └── seeds/              # Seed data
│
└── README.md               # This file
```

## Next Steps

1. **Customize the application** based on your take-home exam requirements
2. **Add features** that demonstrate your skills
3. **Write tests** for critical functionality
4. **Improve UI/UX** with a component library
5. **Add documentation** for any custom features
6. **Optimize performance** and add error handling

## Development Workflow

### Daily Development
1. Start PostgreSQL (if not running)
2. Run backend: `cd backend && npm run dev`
3. Run frontend: `cd frontend && npm run dev`
4. Make changes and test
5. Commit regularly with meaningful messages

### Before Submission
1. Test all features thoroughly
2. Update README with any changes
3. Ensure all environment variables are documented
4. Remove any sensitive data
5. Test the setup instructions from scratch
6. Create a clean commit history

## Getting Help

- **Backend issues**: Check `backend/README.md`
- **Frontend issues**: Check `frontend/README.md`
- **Database issues**: Check PostgreSQL logs
- **API testing**: Use Postman/Thunder Client/curl examples above

Good luck with your take-home exam! 🚀
