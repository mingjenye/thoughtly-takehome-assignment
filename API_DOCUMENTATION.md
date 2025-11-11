# API Documentation

Base URL: `http://localhost:3001/api/v1`

## Authentication

**No authentication required** - This is a simplified system where users are identified by ID only.

## API Endpoints

### 1. Tickets Endpoints

#### Get Available Tickets
```http
GET /tickets?eventId=1
```

**Description:** Retrieves all available tickets grouped by tier with pricing information.

**Query Parameters:**
- `eventId` (optional): Event ID, defaults to 1

**Response:**
```json
{
  "success": true,
  "data": {
    "eventId": 1,
    "tiers": [
      {
        "name": "VIP",
        "price": 100,
        "available": 10,
        "tickets": [...]
      },
      {
        "name": "Front Row",
        "price": 50,
        "available": 20,
        "tickets": [...]
      },
      {
        "name": "GA",
        "price": 10,
        "available": 100,
        "tickets": [...]
      }
    ],
    "totalAvailable": 130
  }
}
```

#### Create Tickets (Admin)
```http
POST /tickets/create
```

**Description:** Creates new tickets for an event. This is an admin function.

**Request Body:**
```json
{
  "eventId": 1,
  "vipCount": 10,
  "frontRowCount": 20,
  "gaCount": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tickets created successfully",
  "data": {
    "created": 130,
    "breakdown": {
      "vip": 10,
      "frontRow": 20,
      "ga": 100
    }
  }
}
```

#### Get Ticket by ID
```http
GET /tickets/:id
```

**Description:** Retrieves a single ticket by its ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "event_id": 1,
    "tier": "VIP",
    "status": "available",
    "user_id": null,
    "booked_at": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 2. Booking Endpoints

#### Reserve Tickets (Step 1)
```http
POST /booking/reserve
```

**Description:** Reserves tickets for a user. This is the first step of the booking process. Uses database transactions and row-level locking to prevent double-booking.

**Request Body:**
```json
{
  "userId": 1,
  "eventId": 1,
  "tickets": [
    { "tier": "VIP", "quantity": 2 },
    { "tier": "GA", "quantity": 3 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "reservedTickets": [
      {
        "id": 1,
        "event_id": 1,
        "tier": "VIP",
        "status": "pending",
        "user_id": 1,
        ...
      },
      ...
    ],
    "message": "Tickets reserved successfully. Please confirm your booking."
  }
}
```

**Error Response (Insufficient Tickets):**
```json
{
  "error": {
    "message": "Insufficient tickets available for VIP. Available: 1, Requested: 2",
    "status": 400
  }
}
```

#### Confirm Booking (Step 2)
```http
POST /booking/confirm
```

**Description:** Confirms the booking after payment. Updates ticket status to 'booked' and adds ticket IDs to user's tickets array.

**Request Body:**
```json
{
  "userId": 1,
  "ticketIds": [1, 2, 3],
  "paymentSimulation": "success"
}
```

**Payment Simulation Values:**
- `"success"` - Simulates successful payment (default)
- `"fail"` - Simulates payment failure

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "confirmedTickets": [
      {
        "id": 1,
        "event_id": 1,
        "tier": "VIP",
        "status": "booked",
        "user_id": 1,
        "booked_at": "2024-01-01T12:00:00.000Z",
        ...
      },
      ...
    ],
    "message": "Booking confirmed successfully!"
  }
}
```

**Response (Payment Failed):**
```json
{
  "success": false,
  "data": {
    "success": false,
    "message": "Payment failed. Tickets have been released."
  }
}
```

#### Get User Bookings
```http
GET /booking/user/:userId
```

**Description:** Retrieves all bookings for a specific user.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "userName": "John Doe",
    "tickets": [
      {
        "id": 1,
        "event_id": 1,
        "tier": "VIP",
        "status": "booked",
        "user_id": 1,
        "booked_at": "2024-01-01T12:00:00.000Z",
        ...
      },
      ...
    ],
    "totalTickets": 5
  }
}
```

---

### 3. Users Endpoints

#### Get All Users
```http
GET /users
```

**Description:** Retrieves all users in the system.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "tickets": ["1", "2", "3"],
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    ...
  ]
}
```

#### Get User by ID
```http
GET /users/:id
```

**Description:** Retrieves a single user by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "tickets": ["1", "2", "3"],
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Create User
```http
POST /users
```

**Description:** Creates a new user.

**Request Body:**
```json
{
  "name": "Jane Smith"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 4,
    "name": "Jane Smith",
    "tickets": [],
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "message": "Error description",
    "status": 400
  }
}
```

### Common Error Status Codes

- `400` - Bad Request (validation errors, insufficient tickets)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Example Error Responses

**Validation Error:**
```json
{
  "error": {
    "message": "User not found",
    "status": 404
  }
}
```

**Insufficient Tickets:**
```json
{
  "error": {
    "message": "Insufficient tickets available for VIP. Available: 1, Requested: 2",
    "status": 400
  }
}
```

**Ticket Already Booked:**
```json
{
  "error": {
    "message": "Ticket 123 is not in pending status. Current status: booked",
    "status": 400
  }
}
```

---

## Race Condition Prevention

### How Double-Booking is Prevented

1. **Row-Level Locking with SKIP LOCKED:**
   ```sql
   SELECT id FROM tickets 
   WHERE event_id = $1 AND tier = $2 AND status = 'available'
   ORDER BY id
   LIMIT 1
   FOR UPDATE SKIP LOCKED
   ```
   - `FOR UPDATE` locks the selected row
   - `SKIP LOCKED` ensures concurrent requests get different tickets
   - Guarantees no two requests can lock the same ticket

2. **Database Transactions:**
   - All booking operations wrapped in `BEGIN...COMMIT` transaction
   - If any step fails, entire transaction is rolled back
   - Ensures atomicity and consistency

3. **Event-Level Locking:**
   - Event row is locked during ticket reservation
   - Prevents race conditions on available count updates

4. **Two-Step Process:**
   - **Reserve**: Tickets status → `pending`, unavailable to others
   - **Confirm**: After payment, tickets status → `booked`
   - If payment fails, tickets released back to `available`

### Testing Concurrent Bookings

You can test the system's ability to handle concurrent bookings:

```bash
# Terminal 1
curl -X POST http://localhost:3001/api/v1/booking/reserve \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"tickets":[{"tier":"VIP","quantity":1}]}'

# Terminal 2 (run simultaneously)
curl -X POST http://localhost:3001/api/v1/booking/reserve \
  -H "Content-Type: application/json" \
  -d '{"userId":2,"tickets":[{"tier":"VIP","quantity":1}]}'
```

Both requests should succeed and receive different ticket IDs.

---

## Example Workflows

### Complete Booking Flow

1. **Get Available Tickets:**
   ```bash
   curl http://localhost:3001/api/v1/tickets?eventId=1
   ```

2. **Reserve Tickets:**
   ```bash
   curl -X POST http://localhost:3001/api/v1/booking/reserve \
     -H "Content-Type: application/json" \
     -d '{
       "userId": 1,
       "tickets": [
         {"tier": "VIP", "quantity": 2},
         {"tier": "GA", "quantity": 3}
       ]
     }'
   ```

3. **Confirm Booking:**
   ```bash
   curl -X POST http://localhost:3001/api/v1/booking/confirm \
     -H "Content-Type: application/json" \
     -d '{
       "userId": 1,
       "ticketIds": [1, 2, 3, 4, 5],
       "paymentSimulation": "success"
     }'
   ```

4. **Check User Bookings:**
   ```bash
   curl http://localhost:3001/api/v1/booking/user/1
   ```

### Admin: Create Tickets

```bash
curl -X POST http://localhost:3001/api/v1/tickets/create \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "vipCount": 10,
    "frontRowCount": 20,
    "gaCount": 100
  }'
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider:
- Per-IP rate limiting (express-rate-limit)
- Per-user rate limiting for booking endpoints
- Recommended: 10 requests/minute for booking endpoints

## CORS Configuration

CORS is configured to accept requests from:
- `http://localhost:3000` (development frontend)

For production, update `FRONTEND_URL` environment variable to your production frontend URL.


