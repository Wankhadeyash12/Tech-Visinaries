# FlexHub API Routes - Complete Reference

## Authentication Routes
```
POST   /api/auth/register         - Register new user
POST   /api/auth/login            - Login user (returns JWT token)
```

## Event Routes
```
POST   /api/events/create         - Create event (organizer only)
GET    /api/events/organizer-events - Get user's events (organizer only)
GET    /api/events/browse/all    - Get all published events (public)
GET    /api/events/public/:slug  - Get event details by slug (public)
PUT    /api/events/:id           - Update event (organizer only)
DELETE /api/events/:id           - Delete event (organizer only)
POST   /api/events/:id/publish   - Publish event (organizer only)
GET    /api/events/:id/registrations - Get event registrations (organizer only)
```

## Registration Routes
```
POST   /api/registrations/register - Register for event (participant only)
GET    /api/registrations/my-registrations - Get user's registrations (participant only)
PUT    /api/registrations/:id/approve - Approve registration (organizer only)
PUT    /api/registrations/:id/reject - Reject registration (organizer only)
```

## Payment Routes (NEW)
```
POST   /api/payments/create-checkout-session - Create Stripe checkout (participant only)
GET    /api/payments/session-details         - Get payment details (participant only)
POST   /api/payments/webhook                 - Stripe webhook (no auth)
```

## Analytics Routes
```
GET    /api/analytics/event/:id     - Get event analytics (organizer only)
GET    /api/analytics/dashboard     - Get organizer dashboard analytics
```

## Page Routes
```
GET    /                             - Home page
GET    /login                        - Login page
GET    /register                     - Registration page
GET    /browse-events                - Browse events page
GET    /create-event                 - Create event page
GET    /event-details                - Event details page
GET    /participate                  - Registration form page
GET    /participant-dashboard        - Participant dashboard
GET    /organizer-dashboard          - Organizer dashboard
GET    /analytics                    - Analytics page
GET    /payment-success             - Payment success page (NEW)
GET    /payment-cancel              - Payment cancellation page (NEW)
```

---

## Detailed API Documentation

### Authentication

#### POST /api/auth/register
Register a new user account.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "participant",  // or "organizer"
  "college": "XYZ College"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "participant"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "participant"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Events

#### POST /api/events/create
Create a new event (organizer only).

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: multipart/form-data
```

**Form Data:**
```
title: "Summer Hackathon 2024"
description: "24-hour coding competition"
eventMode: "online"  // online, offline, hybrid
eventDateTime: "2024-07-15T09:00:00Z"
registrationDeadline: "2024-07-14T23:59:59Z"
venue: "Tech Park" (if offline/hybrid)
meetingLink: "https://zoom.us/j/..." (if online/hybrid)
registrationFee: 100
teamMinSize: 2
teamMaxSize: 5
rules: "Competition rules here..."
banner: [FILE UPLOAD]
```

**Response (201):**
```json
{
  "message": "Event created successfully",
  "event": {
    "_id": "507f1f77bcf86cd799439012",
    "slug": "summer-hackathon-2024",
    "title": "Summer Hackathon 2024",
    "isPublished": false,
    "registrationFee": 100
  }
}
```

---

#### GET /api/events/browse/all
Get all published events with search/filter/sort.

**Query Parameters:**
```
search?: string (searches title & description)
mode?: string (online, offline, hybrid)
sortBy?: string (latest, upcoming, trending)
```

**Response (200):**
```json
{
  "message": "Events retrieved successfully",
  "count": 5,
  "events": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "slug": "summer-hackathon-2024",
      "title": "Summer Hackathon 2024",
      "eventMode": "online",
      "eventDateTime": "2024-07-15T09:00:00Z",
      "registrationFee": 100,
      "teamMinSize": 2,
      "teamMaxSize": 5,
      "totalRegistrations": 3,
      "organizer": {
        "_id": "507f1f77bcf86cd799439001",
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    }
  ]
}
```

---

#### POST /api/events/:id/publish
Publish a draft event to make it visible.

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "message": "Event published successfully",
  "event": {
    "_id": "507f1f77bcf86cd799439012",
    "isPublished": true
  }
}
```

---

### Registrations

#### POST /api/registrations/register
Register for an event.

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**
```json
{
  "eventSlug": "summer-hackathon-2024",
  "teamName": "Code Warriors",
  "teamMembers": [
    {
      "name": "Alice Johnson",
      "email": "alice@example.com"
    },
    {
      "name": "Bob Smith",
      "email": "bob@example.com"
    }
  ]
}
```

**Response (201) - If no payment required:**
```json
{
  "message": "Registered successfully",
  "registration": {
    "_id": "507f1f77bcf86cd799439013",
    "event": "507f1f77bcf86cd799439012",
    "participant": "507f1f77bcf86cd799439001",
    "teamName": "Code Warriors",
    "paymentStatus": "Completed",
    "approvalStatus": "Pending"
  }
}
```

---

### Payments (NEW)

#### POST /api/payments/create-checkout-session
Create a Stripe checkout session for event registration.

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**
```json
{
  "eventSlug": "summer-hackathon-2024",
  "teamName": "Code Warriors",
  "teamMembers": [
    {
      "name": "Alice Johnson",
      "email": "alice@example.com"
    },
    {
      "name": "Bob Smith",
      "email": "bob@example.com"
    }
  ]
}
```

**Response (200):**
```json
{
  "message": "Checkout session created",
  "sessionId": "cs_test_51234567890abcdefghij",
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_51234567890abcdefghij",
  "registrationId": "507f1f77bcf86cd799439013"
}
```

**Response (400):**
```json
{
  "message": "Missing required fields"
}
```

**Response (404):**
```json
{
  "message": "Event not found"
}
```

**Response (409):**
```json
{
  "message": "Already registered for this event"
}
```

---

#### GET /api/payments/session-details
Get payment session and registration details.

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Query Parameters:**
```
sessionId: string (required) - Stripe checkout session ID
```

**Response (200):**
```json
{
  "message": "Payment session details retrieved",
  "session": {
    "id": "cs_test_51234567890abcdefghij",
    "status": "complete",
    "amount_total": 10000,
    "currency": "inr",
    "customer_email": "alice@example.com"
  },
  "registration": {
    "id": "507f1f77bcf86cd799439013",
    "teamName": "Code Warriors",
    "event": {
      "title": "Summer Hackathon 2024",
      "slug": "summer-hackathon-2024"
    },
    "paymentStatus": "Completed",
    "approvalStatus": "Pending"
  }
}
```

---

#### POST /api/payments/webhook
Receive Stripe webhook events. **No authentication required**.

**Headers (from Stripe):**
```
stripe-signature: {SIGNATURE}
Content-Type: application/json
```

**Webhook Events Handled:**

1. **checkout.session.completed:**
   - Updates registration: `paymentStatus = "Completed"`
   - Updates event: `totalRegistrations += 1`
   - Stores: `stripePaymentIntentId`

2. **payment_intent.payment_failed:**
   - Updates registration: `paymentStatus = "Failed"`

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Successful GET request |
| 201 | Created - Successful POST/creation |
| 400 | Bad Request - Invalid data or missing fields |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - User lacks required role |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate registration |
| 500 | Server Error - Unexpected error |

---

## Error Response Format

All error responses follow this format:

```json
{
  "message": "Error description here"
}
```

---

## Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer {JWT_TOKEN}
```

Token obtained from `/api/auth/login` or `/api/auth/register`.

---

## Rate Limiting

Currently: None (add for production)

Recommended:
- 100 requests/minute per user
- 1000 requests/minute per IP

---

## Pagination

Not currently implemented but recommended for:
- GET /api/events/browse/all
- GET /api/registrations/my-registrations
- GET /api/analytics/event/:id

---

## Field Validation

### Event Fields:
- `title`: Required, max 100 chars
- `description`: Required, max 5000 chars
- `eventDateTime`: Required, must be future date
- `registrationDeadline`: Required, must be before eventDateTime
- `teamMinSize`: Required, min 1
- `teamMaxSize`: Required, max team size >= min size
- `registrationFee`: Optional, default 0
- `eventMode`: Required, enum: online|offline|hybrid

### Registration Fields:
- `teamName`: Required, max 100 chars
- `teamMembers`: Required, array with 1+ items
- `teamMembers[].name`: Required, max 100 chars
- `teamMembers[].email`: Required, valid email format

---

## API Usage Examples

### Register and Pay for Event

```javascript
// 1. Login
const loginRes = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'alice@example.com',
    password: 'password123'
  })
});
const { token } = await loginRes.json();

// 2. Create checkout session
const checkoutRes = await fetch('/api/payments/create-checkout-session', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    eventSlug: 'summer-hackathon-2024',
    teamName: 'Code Warriors',
    teamMembers: [
      { name: 'Alice Johnson', email: 'alice@example.com' }
    ]
  })
});
const { checkoutUrl } = await checkoutRes.json();

// 3. Redirect to Stripe
window.location.href = checkoutUrl;
```

---

## Versioning

Current API Version: v1 (no version prefix)

Future: Consider adding `/api/v2/` for backward compatibility

---

## CORS Headers

Enabled for all origins (can be restricted in production):

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Best Practices

1. Always include `Authorization` header for authenticated endpoints
2. Always use HTTPS in production
3. Store tokens securely (httpOnly cookies recommended)
4. Implement token refresh mechanism
5. Add request validation on frontend before sending
6. Log all payment-related requests for audit trail
7. Monitor webhook events for failures
8. Implement exponential backoff for retries

---

**Last Updated:** March 2026
**API Status:** Production Ready ✓
