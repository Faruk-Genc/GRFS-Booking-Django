# 🚀 How to Start Your Web App

## ✅ Step 1: Set Up Your .env File

Your `.env` file doesn't exist yet. Here's how to create it:

1. **Generate a SECRET_KEY:**
   ```bash
   cd room_booking
   python generate_secret_key.py
   ```
   Copy the generated key that appears.

2. **Create .env file:**
   ```bash
   # Windows PowerShell
   Copy-Item env.example .env
   
   # macOS/Linux
   cp env.example .env
   ```

3. **Edit `.env` file** (open in any text editor) and update:
   - `SECRET_KEY=your-generated-key-here` ← Paste the key from step 1
   - `DB_PASSWORD=your-postgresql-password` ← Your PostgreSQL password

## ✅ Step 2: Verify Your .env File

Your `.env` file should look like this:

```env
# Django Settings
SECRET_KEY=django-insecure-abc123xyz... (your generated key)
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DB_NAME=room_booking
DB_USER=room_admin
DB_PASSWORD=your-actual-postgresql-password
DB_HOST=localhost
DB_PORT=5432

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

**Important checks:**
- ✅ SECRET_KEY is set (not the placeholder)
- ✅ DB_PASSWORD matches your PostgreSQL password
- ✅ No quotes around values
- ✅ File is in `room_booking/` directory (same level as `manage.py`)

## ✅ Step 3: Start the Backend

Open **Terminal 1**:

```bash
# Navigate to project root
cd GRFS-Booking-Django

# Activate virtual environment
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# Go to Django project
cd room_booking

# Run migrations (first time only)
python manage.py migrate

# Start the server
python manage.py runserver
```

✅ **Backend should be running at:** `http://localhost:8000`

You should see:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

## ✅ Step 4: Start the Frontend

Open **Terminal 2** (keep backend running):

```bash
# Navigate to frontend directory
cd GRFS-Booking-Django\frontend

# Install dependencies (first time only)
npm install

# Start the frontend
npm start
```

✅ **Frontend should be running at:** `http://localhost:3000`

The browser should automatically open. If not, manually go to `http://localhost:3000`

## ✅ Step 5: Test the Application

1. **Register a new user:**
   - Click "Register" on the login page
   - Fill in: First Name, Last Name, Email, Password (min 8 chars)
   - Submit

2. **Login:**
   - Use your email and password
   - You'll be redirected to the booking page

3. **Create a booking:**
   - Select floors/rooms
   - Choose a date and time
   - Submit your booking

## 🔧 Troubleshooting

### Backend won't start

**Error: "SECRET_KEY environment variable must be set"**
- ✅ Check `.env` file exists in `room_booking/` directory
- ✅ Verify SECRET_KEY line doesn't have quotes
- ✅ Make sure there are no extra spaces

**Error: Database connection failed**
- ✅ Ensure PostgreSQL is running
- ✅ Check database credentials in `.env` match your PostgreSQL setup
- ✅ Verify database `room_booking` exists: `psql -U postgres -c "\l"`

**Error: ModuleNotFoundError**
- ✅ Activate virtual environment: `venv\Scripts\activate` (Windows)
- ✅ Install dependencies: `pip install -r ../requirements.txt`

### Frontend won't start

**Error: Cannot find module**
- ✅ Run `npm install` in `frontend/` directory

**Error: Connection refused**
- ✅ Make sure backend is running on port 8000
- ✅ Check CORS settings in `.env` match frontend URL

### Database Issues

**Create database if it doesn't exist:**
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Run these commands
CREATE DATABASE room_booking;
CREATE USER room_admin WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE room_booking TO room_admin;
\q
```

## 📝 Quick Commands Reference

```bash
# Backend
cd room_booking
python manage.py runserver          # Start server
python manage.py migrate             # Run migrations
python manage.py createsuperuser    # Create admin user

# Frontend
cd frontend
npm start                            # Start dev server
npm install                          # Install dependencies
```

## 🎯 Next Steps

- Create test data via Django admin: `http://localhost:8000/admin`
- Explore API at: `http://localhost:8000/api/`
- Check `QUICK_START.md` for more details
- Review `SECURITY_AND_EFFICIENCY_REVIEW.md` for recent improvements

---

**Need help?** Check the main `README.md` for detailed documentation.

