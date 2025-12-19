@echo off
REM Production build script for GRFS Booking Django (Windows)

echo Building React frontend...
cd frontend
call npm install
set VITE_API_URL=/api/
call npm run build

echo Copying React build to Django static files...
cd ..
if not exist "room_booking\staticfiles" mkdir room_booking\staticfiles
if not exist "room_booking\booking\templates" mkdir room_booking\booking\templates
REM Copy React static files (JS, CSS, etc.)
xcopy /E /I /Y frontend\build\static room_booking\staticfiles\static
REM Copy other assets (favicon, manifest, etc.)
if exist "frontend\build\favicon.ico" copy /Y frontend\build\favicon.ico room_booking\staticfiles\
if exist "frontend\build\manifest.json" copy /Y frontend\build\manifest.json room_booking\staticfiles\
REM Copy index.html to templates (will be updated by collectstatic)
copy /Y frontend\build\index.html room_booking\booking\templates\

echo Collecting Django static files...
cd room_booking
python manage.py collectstatic --noinput

echo Build complete!
echo Next steps:
echo 1. Update .env file with production settings
echo 2. Run migrations: python manage.py migrate
echo 3. Deploy to Render (see RENDER_DEPLOY.md)

pause

