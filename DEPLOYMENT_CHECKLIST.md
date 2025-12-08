# Deployment Checklist

Use this checklist to ensure your deployment is complete and secure.

## Pre-Deployment

- [ ] Build React frontend with production API URL (`REACT_APP_API_URL=/api/`)
- [ ] Update `.env` file with production settings
- [ ] Generate new `SECRET_KEY` for production (50+ characters)
- [ ] Set `DEBUG=False` in `.env`
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Update `CORS_ALLOWED_ORIGINS` with production domain
- [ ] Test database connection locally with production credentials (if possible)

## Platform Setup (Render)

- [ ] Create Render account
- [ ] Connect GitHub repository
- [ ] Create PostgreSQL database on Render
- [ ] Create Web Service on Render
- [ ] Configure build and start commands
- [ ] Set all environment variables in Render dashboard

## Environment Variables

- [ ] `SECRET_KEY` - Strong, unique key
- [ ] `DEBUG=False`
- [ ] `ALLOWED_HOSTS` - Your domain(s)
- [ ] Database credentials (auto-linked if using render.yaml)
- [ ] `CORS_ALLOWED_ORIGINS` - Your frontend URL(s)
- [ ] Email configuration (SMTP settings)
- [ ] `SITE_URL` - Your production URL

## Database Setup

- [ ] Database created on Render
- [ ] Database credentials configured
- [ ] Run migrations: `python manage.py migrate`
- [ ] Create superuser: `python manage.py createsuperuser`

## Static Files

- [ ] `collectstatic` runs during build
- [ ] Verify staticfiles directory has files
- [ ] Test that static files are accessible

## Testing

- [ ] Visit homepage - React app loads
- [ ] Test API endpoint: `/api/floors/`
- [ ] Test user registration
- [ ] Test user login
- [ ] Test booking creation
- [ ] Test admin panel: `/admin/`
- [ ] Test admin dashboard: `/admin` (if separate route)
- [ ] Test email sending (if configured)

## Security

- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY` set
- [ ] `ALLOWED_HOSTS` configured correctly
- [ ] Environment variables are secure (not in code)
- [ ] HTTPS is enabled (automatic on Render)
- [ ] CORS origins are set correctly

## Post-Deployment

- [ ] Set up custom domain (if applicable)
- [ ] Configure DNS records
- [ ] Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` for custom domain
- [ ] Set up scheduled tasks (booking reminders) if needed
- [ ] Monitor application logs
- [ ] Set up error tracking (optional)
