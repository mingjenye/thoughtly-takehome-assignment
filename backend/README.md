# Backend API

Node.js/Express backend API with TypeScript and PostgreSQL.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/takehome_db
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

#### Create Database
```bash
# Using psql
psql -U postgres
CREATE DATABASE takehome_db;
\q
```

#### Run Migrations
```bash
# Option 1: Using psql
psql -U postgres -d takehome_db -f ../database/migrations/001_create_users_table.sql
psql -U postgres -d takehome_db -f ../database/migrations/002_create_items_table.sql

# Option 2: Using npm script (if configured)
npm run migrate
```

#### Seed Database (Optional)
```bash
psql -U postgres -d takehome_db -f ../database/seeds/001_seed_data.sql
# or
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```

Server will run on `http://localhost:3001`

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting errors

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # Route handlers
│   ├── services/         # Business logic
│   ├── repositories/     # Data access layer
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── validators/       # Request validation schemas
│   ├── config/           # Configuration files
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Helper functions
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user

### Items
- `GET /api/v1/items` - Get all items (requires auth)
- `GET /api/v1/items/:id` - Get item by ID (requires auth)
- `POST /api/v1/items` - Create item (requires auth)
- `PUT /api/v1/items/:id` - Update item (requires auth)
- `DELETE /api/v1/items/:id` - Delete item (requires auth)

### Health Check
- `GET /health` - Health check endpoint

## Testing the API

### Using curl

#### Register a user
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

#### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Create an item (with auth token)
```bash
curl -X POST http://localhost:3001/api/v1/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"New Item","description":"Item description","status":"pending"}'
```

## Development Notes

### Architecture Pattern
This backend follows the Controller → Service → Repository pattern:

- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Repositories**: Handle database operations

### Error Handling
All errors are handled by the centralized error handler middleware. Custom error classes are available:
- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `ValidationError` (422)

### Authentication

**TODO NOTE - Authentication Not Yet Implemented**

#### Current Implementation (Simplified)
- Users manually enter their `userId` in the frontend
- The `userId` is sent in the request body to the backend
- **Security Risk**: Anyone can impersonate any user by changing the `userId`

#### Why This Approach?

**Purpose for Take-Home Exam:**
- Focus on demonstrating core booking logic and race condition prevention
- Quick testing and demonstration without login complexity
- Faster development to showcase transaction handling and concurrency control

**Trade-offs:**
| Aspect | Current (Simplified) | Next Step (JWT Auth) |
|--------|---------------------|----------------------|
| **Security** | ❌ No user verification | ✅ Token-based authentication |
| **Testing** | ✅ Easy to test multiple users | ⚠️ Need login for each test |
| **User Experience** | ❌ Manual ID entry | ✅ Seamless after login |

#### Why JWT Auth Would Be Better
JWT (JSON Web Token) authentication provides:
- **User Verification**: Backend can trust the user identity from the signed token
- **Stateless**: No session storage needed on the server
- **Scalability**: Works across multiple backend instances
- **Industry Standard**: Well-established pattern for RESTful APIs

#### JWT Mechanism Overview

```
1. User Login → Backend verifies credentials → Returns signed JWT token
2. Frontend stores token (localStorage/cookie)
3. Every API request includes token in Authorization header
4. Backend verifies token signature and extracts user info
5. Request processed with authenticated user context
```

See inline code comments in controllers for specific implementation points.

### Ticket ID Strategy

**Current Implementation:** PostgreSQL `SERIAL` (auto-increment integer) for ticket IDs.

**Limitations for Distributed Systems:**

PostgreSQL SERIAL IDs work well for single-instance deployments but have critical limitations in distributed architectures:

1. **No Global Uniqueness**: Each database instance generates its own sequence, causing ID collisions across data centers
2. **Not Idempotent**: Retry logic creates duplicate tickets with different IDs
3. **Coordination Overhead**: Requires expensive distributed sequence coordination
4. **Sharding Complexity**: Makes database partitioning difficult

**Alternative Approaches:**

| Approach | Best For | Key Benefit |
|----------|----------|-------------|
| **PostgreSQL SERIAL** (current) | Single-instance systems | Simple, built-in |
| **UUID (v4)** | Systems prioritizing simplicity | Globally unique, no coordination |
| **Snowflake-like ID** | Distributed systems at scale | Globally unique, time-sortable, compact |

**Snowflake-like ID Benefits:**
- Globally unique without coordination
- Time-sortable (can extract creation timestamp)
- Compact (64-bit integer vs 128-bit UUID)
- High throughput (4096 IDs/ms per machine)
- Idempotent-friendly

**Structure:**
```
64-bit: Timestamp(41) + DataCenter(5) + Machine(5) + Sequence(12)
```

**Migration Path:**

If migrating to globally unique IDs for distributed deployment:

1. **Add unique ID column:** Add `ticket_unique_id VARCHAR(20) UNIQUE` to tickets table with index
   
2. **Create ID generator:** Implement Snowflake-like generator in `src/utils/idGenerator.ts` with timestamp, datacenter, machine, and sequence components

3. **Update ticket creation:** Modify `TicketRepository.createBulk()` to generate unique IDs before insertion (see code comments in `src/repositories/ticket.repository.ts`)

4. **Update service layer:** Generate IDs in `TicketService.createTickets()` before calling repository (see code comments in `src/services/ticket.service.ts`)

5. **Migrate API gradually:**
   - Keep SERIAL ID for internal database relationships
   - Expose unique ID to external APIs  
   - Update frontend to use unique IDs

6. **Consider existing solutions:** npm packages like `snowflake-id`, `uid-generator`, or `uuid` for faster implementation

**When to Implement:**
- ✅ Before multi-region deployment
- ✅ When implementing database sharding
- ⚠️ Not critical for current single-instance take-home exam

See inline code comments in ticket repository for implementation points.

### Validation
Request validation is done using Joi schemas in the validators directory.

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify DATABASE_URL in .env
- Check database exists and credentials are correct

### Port Already in Use
Change PORT in .env file if 3001 is already in use

### TypeScript Errors
Run `npm run build` to check for type errors
