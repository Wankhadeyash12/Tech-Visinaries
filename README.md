# FlexHub - Event Management Platform 🎉

A full-stack web application for creating, managing, and registering for events with flexible team structures and comprehensive analytics.

## Features

### For Organizers 🎯
- Create, edit, delete, and publish events
- Flexible team size rules (min/max members)
- Banner image uploads
- Event registration management
- Approval/rejection of registrations
- Analytics dashboard with charts
- Revenue tracking (paid/pending)
- Shareable event URLs with auto-generated slugs

### For Participants 👥
- Browse published events
- Register individually or in teams
- Track registration status
- View event details and guidelines
- Dashboard for all registrations

### Platform Features 🔐
- JWT-based authentication
- Role-based access control (Organizer, Participant)
- Secure password hashing with bcrypt
- File upload handling for event banners
- Real-time analytics with Chart.js
- Responsive design for all devices

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Handling**: Multer
- **Charting**: Chart.js
- **Security**: bcryptjs, CORS

## Project Structure

```
flexhub/
├── client/
│   ├── css/
│   │   ├── style.css          # Global styles
│   │   ├── dashboard.css      # Dashboard styles
│   │   └── event.css          # Event & registration styles
│   ├── js/
│   │   ├── api.js             # API helper functions
│   │   ├── auth.js            # Authentication utilities
│   │   ├── createEvent.js     # Event creation logic
│   │   ├── registerEvent.js   # Event registration logic
│   │   ├── dashboard.js       # Dashboard logic
│   │   └── analytics.js       # Analytics logic
│   ├── pages/
│   │   ├── index.html         # Homepage
│   │   ├── login.html         # Login page
│   │   ├── register.html      # Registration page
│   │   ├── organizer-dashboard.html
│   │   ├── create-event.html
│   │   ├── event-details.html
│   │   ├── participant-dashboard.html
│   │   └── analytics.html
│   └── assets/images/

├── server/
│   ├── config/
│   │   └── db.js              # Database connection
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Event.js           # Event schema
│   │   └── Registration.js    # Registration schema
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── registrationController.js
│   │   └── analyticsController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── registrationRoutes.js
│   │   └── analyticsRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT verification
│   │   └── roleMiddleware.js  # Role-based access
│   ├── services/
│   │   ├── slugService.js     # URL slug generation
│   │   └── analyticsService.js # Analytics calculations
│   ├── uploads/               # Event banner storage
│   └── app.js                 # Express app entry point

├── .env                       # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Step 1: Clone/Navigate to Project
```bash
cd flexhub
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/flexhub
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=3000
UPLOADS_DIR=server/uploads
```

### Step 4: Ensure MongoDB is Running
```bash
# If using local MongoDB
mongod
```

### Step 5: Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## REST API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Events (Organizer)
- `POST /api/events/create` - Create new event (with banner upload)
- `GET /api/events/organizer-events` - Get all events by organizer
- `PUT /api/events/:eventId` - Update event
- `DELETE /api/events/:eventId` - Delete event
- `POST /api/events/:eventId/publish` - Publish event
- `GET /api/events/:eventId/registrations` - Get event registrations

### Events (Public)
- `GET /api/events/public/:slug` - Get event by slug (public access)

### Registrations
- `POST /api/registrations/register` - Register for event
- `GET /api/registrations/my-registrations` - Get participant registrations
- `PUT /api/registrations/:registrationId/approve` - Approve registration (organizer)
- `PUT /api/registrations/:registrationId/reject` - Reject registration (organizer)

### Analytics (Organizer)
- `GET /api/analytics/event/:eventId` - Get event analytics
- `GET /api/analytics/dashboard` - Get organizer dashboard analytics

## Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'organizer' | 'participant',
  college: String,
  createdAt: Date
}
```

### Event
```javascript
{
  title: String,
  description: String,
  rules: String,
  slug: String (unique),
  eventMode: 'online' | 'offline' | 'hybrid',
  venue: String,
  meetingLink: String,
  eventDateTime: Date,
  registrationDeadline: Date,
  teamMinSize: Number,
  teamMaxSize: Number,
  registrationFee: Number,
  bannerImage: String,
  organizer: ObjectId (ref: User),
  isPublished: Boolean,
  totalRegistrations: Number,
  createdAt: Date
}
```

### Registration
```javascript
{
  event: ObjectId (ref: Event),
  participant: ObjectId (ref: User),
  teamName: String,
  teamMembers: [{
    name: String,
    email: String
  }],
  paymentStatus: 'Pending' | 'Completed' | 'Failed',
  approvalStatus: 'Pending' | 'Approved' | 'Rejected',
  registrationFee: Number,
  registeredAt: Date
}
```

## User Flows

### Organizer Flow
1. Register as Organizer
2. Login to Dashboard
3. Create Event (upload banner, set rules, team size, fees)
4. Publish Event (generates shareable slug URL)
5. View Registrations
6. Approve/Reject team registrations
7. View Analytics (registrations per day, revenue, approval ratio)

### Participant Flow
1. Register as Participant
2. Login to Dashboard
3. Browse Events (via public URLs)
4. Register for Event (create team, add members)
5. View Registration Status (approval and payment status)
6. Track event updates

## Key Features Explained

### JWT Authentication
- Users receive a token upon login/registration
- Token is stored in localStorage
- Token included in all protected API requests via `Authorization: Bearer <token>` header
- Tokens expire after 7 days

### Event Slug Generation
- Unique URL-friendly slugs are auto-generated from event titles
- Example: "Hackathon 2024" → "hackathon-2024-1234567890"
- Supports public access without authentication

### Role-Based Access
- **Organizer Routes**: Create/manage events, view analytics, approve registrations
- **Participant Routes**: Register for events, view own registrations
- Middleware checks user role for each protected endpoint

### File Upload
- Event banners stored in `server/uploads/`
- Multer validates file type (image only)
- Files stored with timestamp to ensure uniqueness

### Analytics
- **Total Registrations**: Count of all registrations
- **Registrations Per Day**: Track registration volume over time
- **Approval Ratio**: Approved vs Rejected vs Pending
- **Revenue Tracking**: Paid and pending revenue amounts
- **Charts**: Line chart (timeline), Pie chart (approval status)

## Usage Examples

### Register as Organizer
```javascript
const user = {
  name: "John Organizer",
  email: "john@example.com",
  password: "password123",
  role: "organizer",
  college: "MIT"
};
```

### Create Event
```javascript
const event = {
  title: "AI Hackathon 2024",
  description: "24-hour AI building challenge",
  rules: "Teams must use provided APIs",
  eventMode: "hybrid",
  venue: "Tech Hub, Downtown",
  meetingLink: "https://meet.google.com/...",
  eventDateTime: "2024-04-15T09:00:00",
  registrationDeadline: "2024-04-10T23:59:59",
  teamMinSize: 2,
  teamMaxSize: 4,
  registrationFee: 500
};
```

### Register for Event
```javascript
const registration = {
  eventSlug: "ai-hackathon-2024-1234567890",
  teamName: "Code Crushers",
  teamMembers: [
    { name: "Alice", email: "alice@example.com" },
    { name: "Bob", email: "bob@example.com" }
  ]
};
```

## Security Best Practices

✅ Implemented:
- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based access control
- Input validation
- CORS enabled
- Environment variables for secrets

⚡ Additional Recommendations:
- Use HTTPS in production
- Implement rate limiting
- Add CSRF protection
- Validate file uploads server-side
- Implement database backups
- Add logging and monitoring

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env file
- Verify credentials if using cloud MongoDB

### Port Already in Use
- Change PORT in .env file
- Or kill process: `lsof -ti:3000 | xargs kill -9`

### JWT Errors
- Ensure JWT_SECRET is set in .env
- Clear token in localStorage if changed
- Logout and login again

### File Upload Issues
- Ensure `server/uploads/` directory exists
- Check file permissions
- Verify file size limits in multer config

## Future Enhancements

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] Event templates
- [ ] Leaderboards and scorecards
- [ ] Team collaboration features
- [ ] Mobile app
- [ ] Real-time notifications
- [ ] Advanced filtering and search
- [ ] Event categories/tags
- [ ] User ratings and reviews

## License

MIT

## Support

For issues, feature requests, or questions, please create an issue in the repository.

---

**Happy Event Managing! 🚀**
