# Quick Deployment Guide for Render

## Before You Start

1. Make sure you have:
   - Render account (sign up at https://render.com)
   - GitHub repository with your code
   - Domain name (optional, Render provides free subdomain)

## Quick Steps

### 1. Build for Production (Local - Optional)

**Windows:**
```cmd
build_production.bat
```

**Linux/Mac:**
```bash
chmod +x build_production.sh
./build_production.sh
```

Or manually:
```bash
# Build React
cd frontend
REACT_APP_API_URL=/api/ npm run build

# Collect Django static files
cd ../room_booking
python manage.py collectstatic --noinput
```

### 2. Push to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 3. Deploy on Render

#### Option A: Using render.yaml (Recommended)

1. **Create Blueprint:**
   - Go to Render dashboard
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml` automatically

2. **Review and Apply:**
   - Review the services and database configuration
   - Click "Apply" to create everything

3. **Set Environment Variables:**
   - Go to your Web Service
   - Add environment variables:
     - `SECRET_KEY` (generate a strong key)
     - `DEBUG=False`
     - `ALLOWED_HOSTS=your-app.onrender.com`
     - `CORS_ALLOWED_ORIGINS=https://your-app.onrender.com`
     - Email settings (if needed)

#### Option B: Manual Setup

1. **Create Database:**
   - Click "New +" → "PostgreSQL"
   - Name: `grfs-booking-db`
   - Plan: Starter

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Settings:
     - **Name**: `grfs-booking-backend`
     - **Environment**: `Python 3`
     - **Root Directory**: `room_booking`
     - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
     - **Start Command**: `gunicorn room_booking.wsgi:application`

3. **Link Database:**
   - In Web Service settings, go to "Environment"
   - Link the PostgreSQL database
   - Database variables will be auto-populated

4. **Set Environment Variables:**
   - Add all variables from `env.example`
   - See [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) for details

### 4. Run Migrations

After first deployment:

1. Go to your Web Service
2. Click "Shell" tab
3. Run:
```bash
cd room_booking
python manage.py migrate
python manage.py createsuperuser
```

### 5. Test

Visit `https://your-app-name.onrender.com` - should see your app!

## Important Notes

- **Never commit `.env` file** - it contains secrets
- **Set `DEBUG=False`** in production
- **Use HTTPS** - Render provides SSL automatically
- **Check logs** in Render dashboard if something doesn't work

## Need Help?

See [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) for detailed instructions.
