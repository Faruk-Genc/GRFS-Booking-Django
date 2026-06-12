#!/bin/bash
# Production build script for GRFS Booking Django

echo "Building React frontend..."
cd frontend
npm install
VITE_API_URL=/api/ npm run build

echo "Copying React build to Django static files..."
cd ..
mkdir -p room_booking/staticfiles/static
mkdir -p room_booking/booking/templates
# Copy React static files (JS, CSS, etc.)
cp -r frontend/build/static/* room_booking/staticfiles/static/
# Copy other assets (favicon, manifest, etc.)
cp frontend/build/favicon.ico room_booking/staticfiles/ 2>/dev/null || true
cp frontend/build/manifest.json room_booking/staticfiles/ 2>/dev/null || true
# Copy index.html to templates
cp frontend/build/index.html room_booking/booking/templates/

echo "Collecting Django static files..."
cd room_booking
python manage.py collectstatic --noinput

echo "Build complete!"
echo "Next steps:"
echo "1. Update .env file with production settings"
echo "2. Run migrations: python manage.py migrate"
echo "3. Deploy to Render (see RENDER_DEPLOY.md)"

