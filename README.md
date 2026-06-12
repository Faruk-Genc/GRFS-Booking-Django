# GRFS Room Booking System

A production-ready, full-stack web application for managing room bookings at the Grand River Friendship Society (GRFS). This system provides a comprehensive solution for users to book rooms across multiple floors, with robust admin controls, automated email notifications, and conflict detection to prevent double-bookings.

## 🎯 What This Application Does

The GRFS Room Booking System is a complete booking management platform that enables:

- **User Registration & Approval Workflow**: New users register and await admin approval before gaining access
- **Multi-Floor Room Management**: Organize and book rooms across different building floors
- **Intelligent Booking System**: Create bookings for individual rooms or entire floors with automatic conflict detection
- **Role-Based Access Control**: Four distinct user roles (User, Mentor, Coordinator, Admin) with appropriate permissions
- **Admin Dashboard**: Comprehensive admin interface to view all bookings, approve/deny users, and manage booking statuses
- **Automated Email Notifications**: Email alerts for account creation, approvals, booking confirmations, updates, cancellations, and reminders
- **Booking Types**: Support for both regular bookings and camp bookings with different permission levels
- **Real-Time Availability Checking**: Check room availability before creating bookings

## 🚀 Technology Stack

### Backend
- **Django 5.2.8** - High-level Python web framework
- **Django REST Framework 3.16.1** - Powerful toolkit for building Web APIs
- **PostgreSQL** - Production-grade relational database
- **JWT Authentication** - Secure token-based authentication using `djangorestframework-simplejwt`
- **Gunicorn** - Production WSGI HTTP server
- **WhiteNoise** - Efficient static file serving for Django
- **python-dotenv** - Environment variable management
- **dj-database-url** - Database URL parsing for flexible deployment

### Frontend
- **React 19.2.3** - Modern JavaScript library for building user interfaces
- **React Router 7.9.5** - Declarative routing for React applications
- **Vite 6.0.7** - Next-generation frontend build tool (faster than Create React App)
- **Axios 1.7.9** - Promise-based HTTP client for API requests
- **CSS3** - Custom styling with responsive design

### Infrastructure & Deployment
- **Render** - Cloud platform for hosting (configured via `render.yaml`)
- **PostgreSQL Database** - Managed database service on Render
- **SMTP Email Service** - Configurable email backend for notifications

## ✨ Key Features & Technical Highlights

### Security & Authentication
- **JWT Token-Based Authentication**: Secure access tokens with refresh token support
- **Role-Based Access Control (RBAC)**: Granular permissions for different user types
- **User Approval System**: Admin-controlled user registration workflow
- **CORS Configuration**: Properly configured for production deployment
- **Environment-Based Security**: Separate settings for development and production
- **Password Validation**: Django's built-in password strength validators

### Database Design
- **Optimized Database Schema**: Strategic use of indexes for performance
  - Composite indexes on frequently queried fields (status, start_datetime, user)
  - Foreign key relationships with proper cascading
  - Many-to-many relationships for flexible room bookings
- **Efficient Querying**: Use of `prefetch_related` and `select_related` to minimize database queries
- **Database Migrations**: Version-controlled schema changes

### Business Logic
- **Conflict Detection Algorithm**: Prevents double-bookings by checking overlapping time slots
- **Multi-Room Booking Support**: Book multiple rooms or entire floors in a single transaction
- **Booking Status Management**: Pending → Approved → Cancelled workflow
- **Time Zone Handling**: Proper timezone support (America/New_York) with UTC conversion
- **Booking Type System**: Different booking types (regular, camp) with role-based restrictions

### Email System
- **Automated Email Notifications**:
  - Account creation confirmations
  - User approval/rejection notifications
  - Booking creation confirmations
  - Booking status updates
  - Booking cancellation notices
  - Automated booking reminders (via management command)
- **Graceful Degradation**: Falls back to console backend if email not configured
- **Template-Based Emails**: Structured email content with user and booking details

### Frontend Architecture
- **Component-Based Design**: Reusable React components
- **Protected Routes**: Private routes requiring authentication
- **Admin Route Protection**: Role-based route access
- **Responsive UI**: Modern, user-friendly interface
- **State Management**: React hooks for efficient state handling
- **API Service Layer**: Centralized API calls with Axios

### Production Features
- **Static File Optimization**: WhiteNoise for efficient static file serving
- **Build Process**: Automated build pipeline that compiles React app and integrates with Django
- **Environment Configuration**: Comprehensive environment variable support
- **Error Handling**: Robust error handling and logging throughout the application
- **API Rate Limiting**: Throttling to prevent abuse (100/hour anonymous, 1000/hour authenticated)

## 📁 Project Structure

```
GRFS-Booking-Django/
├── room_booking/                    # Django backend application
│   ├── booking/                     # Main booking app
│   │   ├── models.py               # Database models (User, Floor, Room, Booking)
│   │   ├── views.py                # API views and business logic
│   │   ├── serializers.py          # DRF serializers for API
│   │   ├── urls.py                 # URL routing
│   │   ├── email_utils.py          # Email notification system
│   │   ├── admin.py                # Django admin configuration
│   │   └── management/             # Custom management commands
│   │       └── commands/
│   │           └── send_booking_reminders.py
│   ├── room_booking/               # Django project settings
│   │   ├── settings.py             # Application settings
│   │   ├── urls.py                 # Root URL configuration
│   │   └── wsgi.py                 # WSGI configuration
│   ├── requirements.txt            # Python dependencies
│   └── manage.py                   # Django management script
├── frontend/                        # React frontend application
│   ├── src/
│   │   ├── components/             # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   └── AdminRoute.jsx
│   │   ├── pages/                  # Page components
│   │   │   ├── auth/               # Authentication pages
│   │   │   ├── booking/            # Booking pages
│   │   │   └── dashboard/          # Dashboard pages
│   │   ├── services/               # API service layer
│   │   │   └── api.js
│   │   └── styles/                 # CSS stylesheets
│   ├── public/                     # Static assets
│   ├── package.json                # Node.js dependencies
│   └── vite.config.js              # Vite configuration
├── render.yaml                      # Render deployment configuration
└── README.md                        # This file
```

## 📡 API Endpoints

**API Base URL:** `/api/`

### Authentication
- `POST /auth/register/` - Register a new user (requires admin approval)
- `POST /auth/login/` - Login and receive JWT tokens
- `POST /auth/refresh/` - Refresh access token
- `GET /auth/user/` - Get current authenticated user details

### Floors & Rooms
- `GET /floors/` - List all floors
- `GET /rooms/` - List all rooms (optional: `?floor=<floor_id>`)

### Bookings
- `GET /bookings/` - List bookings (all for admin, own for users)
- `POST /create_booking/` - Create a new booking
  - Body: `{room_ids: [], floor_id: null, start_datetime: "", end_datetime: "", booking_type: "regular"}`
- `GET /bookings/my` - Get current user's bookings
- `GET /bookings/<id>/` - Get booking details
- `GET /check_availability/` - Check room availability for a date/time range

### Admin Endpoints
- `GET /admin/pending-users/` - List users pending approval
- `POST /admin/approve-user/<user_id>/` - Approve or deny a user
- `PATCH /admin/bookings/<booking_id>/status/` - Update booking status
- `DELETE /admin/bookings/delete-all/` - Delete all bookings (admin only)

## 🔒 Security Considerations

- **Never commit `.env` files** - Contains sensitive credentials
- **Use strong SECRET_KEY** - Generate unique keys for each environment
- **Set DEBUG=False in production** - Prevents information leakage
- **Configure ALLOWED_HOSTS** - Restrict to your domain(s)
- **Use HTTPS in production** - Encrypt data in transit
- **Strong database passwords** - Especially important in production
- **Regular dependency updates** - Keep packages up to date

## 🎓 What Makes This Project Stand Out

This project demonstrates:

1. **Full-Stack Development**: Complete application from database to frontend
2. **Production-Ready Code**: Proper error handling, logging, and security practices
3. **Modern Tech Stack**: Latest versions of Django, React, and build tools
4. **RESTful API Design**: Well-structured API following REST principles
5. **Database Optimization**: Strategic indexing and efficient querying
6. **Email Automation**: Comprehensive notification system
7. **Deployment Configuration**: Production deployment setup with Render
8. **Code Organization**: Clean architecture with separation of concerns
9. **User Experience**: Intuitive UI with role-based access
10. **Business Logic**: Complex features like conflict detection and multi-room booking

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

Built as a productional website demonstrating full-stack development capabilities.

---

**Note**: This application was developed for the Grand River Friendship Society to manage their room booking needs efficiently and securely.
