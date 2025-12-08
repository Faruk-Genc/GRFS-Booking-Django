# Deployment Guide

This guide covers deployment options for the GRFS Booking Django application.

## Quick Start

For **Render** deployment (recommended), see [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) for detailed step-by-step instructions.

## Deployment Options

### Render (Recommended)

Render provides:
- Free tier available
- Automatic HTTPS
- PostgreSQL database included
- Easy GitHub integration
- Automatic deployments

See [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) for complete instructions.

### Other Platforms

The application can be deployed to:
- **Heroku**: Similar to Render, uses Procfile
- **Railway**: Similar setup to Render
- **DigitalOcean App Platform**: Supports Django
- **AWS/GCP/Azure**: Requires more configuration

## Pre-Deployment Checklist

- [ ] Build React frontend with production API URL
- [ ] Update `.env` file with production settings
- [ ] Generate new `SECRET_KEY` for production
- [ ] Set `DEBUG=False` in `.env`
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Update `CORS_ALLOWED_ORIGINS` with production domain
- [ ] Set up PostgreSQL database
- [ ] Configure email settings
- [ ] Run migrations
- [ ] Create superuser account

## Environment Variables

See `room_booking/env.example` for all required environment variables.

## Static Files

Static files are served using WhiteNoise. Ensure:
- `STATIC_ROOT` is configured in settings.py
- `collectstatic` runs during deployment
- WhiteNoise middleware is enabled

## Database Migrations

Always run migrations after deployment:
```bash
python manage.py migrate
```

## Security Checklist

- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY` set (50+ characters)
- [ ] `ALLOWED_HOSTS` configured correctly
- [ ] Database password is strong
- [ ] `.env` file is not committed to git
- [ ] HTTPS is enabled
- [ ] CORS origins are set correctly

## Testing After Deployment

1. Visit homepage - React app loads
2. Test API endpoint: `/api/floors/`
3. Test user registration
4. Test user login
5. Test booking creation
6. Test admin panel: `/admin/`
7. Test admin dashboard: `/admin` (if separate route)

## Troubleshooting

### Static Files Not Loading
- Verify `collectstatic` runs during build
- Check `STATIC_ROOT` path
- Ensure WhiteNoise middleware is enabled

### Database Connection Issues
- Verify database credentials in environment variables
- Check database is running
- Ensure migrations are run

### 500 Internal Server Error
- Check application logs
- Verify all environment variables are set
- Check `SECRET_KEY` is configured
- Ensure `DEBUG=False` in production

### CORS Errors
- Verify `CORS_ALLOWED_ORIGINS` includes frontend URL
- Check `CORS_ALLOW_CREDENTIALS` is True
- Ensure frontend API URL is correct
