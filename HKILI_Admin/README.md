# HKILI Backend - Next.js Admin Panel

A Next.js backend application with admin panel for the HKILI App.

## Features

- Admin login system with JWT authentication
- User management dashboard
- Story management system
- MongoDB integration
- Responsive admin panel with Tailwind CSS

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   - Copy `.env.local` and update with your MongoDB URI
   - Default admin credentials: admin@hkili.com / admin123

3. **Database Setup**
   - Ensure MongoDB is running
   - Seed database with sample data:
   ```bash
   npm run seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access Admin Panel**
   - Open http://localhost:3001
   - Login with admin credentials
   - Manage users and stories from the dashboard

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - User registration

### Admin Routes (Requires Authentication)
- `GET /api/users` - Get all users
- `GET /api/stories` - Get all stories
- `POST /api/stories` - Create new story

## Project Structure

```
src/
├── app/
│   ├── admin/          # Admin dashboard
│   ├── login/          # Login page
│   └── api/            # API routes
├── lib/
│   └── mongodb.ts      # Database connection
├── models/
│   ├── User.ts         # User model
│   └── Story.ts        # Story model
└── middleware.ts       # Authentication middleware
```

## Default Admin Credentials

- Email: admin@hkili.com
- Password: admin123

Change these in production by updating the `.env.local` file.