# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Python 3.8+ installed
- ✅ Node.js 14+ installed
- ✅ PostgreSQL 12+ installed and running
- ✅ Virtual environment created and activated

## Step 1: Set Up .env File

1. **Generate SECRET_KEY:**
   ```bash
   cd room_booking
   python generate_secret_key.py
   ```
   Copy the generated key.

2. **Create .env file:**
   ```bash
   # Windows PowerShell
   Copy-Item env.example .env
   
   # macOS/Linux
   cp env.example .env
   ```

3. **Edit .env file** and update these values:
   ```env
   SECRET_KEY=<paste-generated-key-here>
   DB_PASSWORD=<your-postgresql-password>
   ```
   Keep other values as default for local development.

## Step 2: Set Up Database

1. **Create PostgreSQL database:**
   ```sql
   CREATE DATABASE room_booking;
   CREATE USER room_admin WITH PASSWORD 'your-password';
   GRANT ALL PRIVILEGES ON DATABASE room_booking TO room_admin;
   ```

2. **Run migrations:**
   ```bash
   cd room_booking
   python manage.py migrate
   ```

3. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

## Step 3: Start the Application

### Terminal 1 - Backend
```bash
cd room_booking
# Activate venv if not already activated
# Windows: ..\venv\Scripts\activate
# macOS/Linux: source ../venv/bin/activate

python manage.py runserver
```
✅ Backend should be running at `http://localhost:8000`

### Terminal 2 - Frontend
```bash
cd frontend
npm install  # First time only
npm start
```
✅ Frontend should be running at `http://localhost:3000`

## Step 4: Test the Application

1. Open `http://localhost:3000` in your browser
2. Click "Register" to create a new account
3. Login with your credentials
4. Navigate to booking page and create a booking!

## Troubleshooting

**Backend won't start:**
- Check that `.env` file exists in `room_booking/` directory
- Verify SECRET_KEY is set in `.env`
- Ensure PostgreSQL is running
- Check database credentials in `.env`

**Frontend won't start:**
- Run `npm install` in `frontend/` directory
- Check that backend is running on port 8000
- Clear browser cache if needed

**Database connection errors:**
- Verify PostgreSQL is running: `pg_isready` (Linux/Mac) or check Services (Windows)
- Confirm database name, user, and password in `.env` match PostgreSQL setup
- Check PostgreSQL is listening on port 5432

## Next Steps

- Create test data (floors and rooms) via Django admin: `http://localhost:8000/admin`
- Explore API endpoints at `http://localhost:8000/api/`
- Check `SECURITY_AND_EFFICIENCY_REVIEW.md` for recent improvements

