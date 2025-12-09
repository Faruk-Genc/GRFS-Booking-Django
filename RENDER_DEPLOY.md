# Render Deployment Guide

This guide will help you deploy the GRFS Booking Django application to Render.

## Prerequisites

1. Render account (sign up at https://render.com)
2. GitHub account with your code repository
3. PostgreSQL database (provided by Render)

## Step 1: Prepare Your Repository

### 1.1 Build the React Frontend Locally (Optional)

You can build locally or let Render handle it. For local build:

```bash
cd frontend
npm install
REACT_APP_API_URL=/api/ npm run build
```

### 1.2 Update Build Scripts

The `build_production.bat` and `build_production.sh` scripts are available for local testing, but Render will handle the build process.

## Step 2: Set Up on Render

### 2.1 Create a New Web Service

1. Log into your Render dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository containing your code

### 2.2 Configure the Web Service

**Basic Settings:**
- **Name**: `grfs-booking-backend` (or your preferred name)
- **Environment**: `Python 3`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your deployment branch)
- **Root Directory**: Leave empty (repository root)

**Build Command:**
```bash
cd frontend && npm install && REACT_APP_API_URL=/api/ npm run build && cd .. && mkdir -p room_booking/staticfiles/static && mkdir -p room_booking/booking/templates && cp -r frontend/build/static/* room_booking/staticfiles/static/ && cp frontend/build/index.html room_booking/booking/templates/ && pip install -r room_booking/requirements.txt && cd room_booking && python manage.py collectstatic --noinput
```

**Important:** This builds the React app first, then copies the build files to Django's staticfiles directory, then collects static files.

**Start Command:**
```bash
cd room_booking && gunicorn room_booking.wsgi:application
```

### 2.3 Create PostgreSQL Database

1. In Render dashboard, click "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `grfs-booking-db`
   - **Database**: `grfs_booking`
   - **User**: `grfs_admin`
   - **Plan**: Starter (or higher for production)
3. Note the connection details (will be auto-linked if using render.yaml)

### 2.4 Set Environment Variables

In your Web Service settings, add these environment variables:

**Required:**
```
SECRET_KEY=your-strong-secret-key-here-50-plus-characters
DEBUG=False
ALLOWED_HOSTS=your-app-name.onrender.com,yourdomain.com
DB_ENGINE=postgresql
CORS_ALLOWED_ORIGINS=https://your-app-name.onrender.com,https://yourdomain.com
SITE_URL=https://your-app-name.onrender.com
```

**Database (Auto-linked if using render.yaml):**
```
DB_NAME=grfs_booking
DB_USER=grfs_admin
DB_PASSWORD=(auto-filled from database)
DB_HOST=(auto-filled from database)
DB_PORT=5432
```

**Email Configuration:**
```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

### 2.5 Using render.yaml (Recommended)

If you've added `render.yaml` to your repository:

1. In Render dashboard, click "New +" → "Blueprint"
2. Connect your GitHub repository
3. Render will automatically detect `render.yaml` and create services
4. Review and apply the configuration

## Step 3: Deploy

### 3.1 Automatic Deployment

- Render automatically deploys on every push to your main branch
- You can also manually trigger deployments from the dashboard

### 3.2 First Deployment

1. Click "Create Web Service" (or "Apply" for Blueprint)
2. Render will:
   - Install dependencies
   - Run build command
   - Collect static files
   - Start the service

### 3.3 Run Migrations

After first deployment, run migrations:

**Option 1: Via Render Shell**
1. Go to your Web Service
2. Click "Shell" tab
3. Run:
```bash
cd room_booking
python manage.py migrate
python manage.py createsuperuser
```

**Option 2: Via Local Connection**
```bash
# Set DATABASE_URL from Render dashboard
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
cd room_booking
python manage.py migrate
python manage.py createsuperuser
```

## Step 4: Configure Custom Domain (Optional)

1. In your Web Service settings, go to "Custom Domains"
2. Add your domain
3. Update DNS records as instructed by Render
4. Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` to include your domain

## Step 5: Set Up Static Files

Static files are automatically served by WhiteNoise. Ensure:
- `STATIC_ROOT` is set in settings.py
- `collectstatic` runs during build
- WhiteNoise middleware is enabled (already configured)

## Step 6: Verify Deployment

1. Visit your Render URL: `https://your-app-name.onrender.com`
2. Test API: `https://your-app-name.onrender.com/api/floors/`
3. Test admin: `https://your-app-name.onrender.com/admin/`
4. Test user registration and login

## Step 7: Set Up Scheduled Tasks (Booking Reminders)

For the booking reminder cron job:

1. In Render dashboard, click "New +" → "Background Worker"
2. Configure:
   - **Name**: `grfs-booking-reminders`
   - **Environment**: `Python 3`
   - **Root Directory**: `room_booking`
   - **Start Command**: `python manage.py send_booking_reminders`
   - **Schedule**: `0 9 * * *` (runs daily at 9 AM)

## Troubleshooting

### Build Fails

- Check build logs in Render dashboard
- Verify `requirements.txt` is correct
- Ensure Python version matches (3.12.0)

### Database Connection Issues

- Verify database is created and running
- Check environment variables are set correctly
- Ensure database user has proper permissions

### Static Files Not Loading

- Verify `collectstatic` runs in build command
- Check `STATIC_ROOT` path is correct
- Ensure WhiteNoise middleware is enabled

### 500 Internal Server Error

- Check service logs in Render dashboard
- Verify all environment variables are set
- Check database migrations are run
- Ensure `SECRET_KEY` is set

### CORS Errors

- Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Check `CORS_ALLOW_CREDENTIALS` is True
- Ensure frontend API URL is correct

## Environment Variables Reference

See `room_booking/env.example` for all available environment variables.

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Django on Render](https://render.com/docs/deploy-django)
- [PostgreSQL on Render](https://render.com/docs/databases)

