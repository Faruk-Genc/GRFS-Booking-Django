# Email Configuration Guide

This guide explains how to configure email notifications for the GRFS Booking System.

## Email Features

The system sends email notifications for:
1. **Account Creation** - When a new user registers
2. **Account Approval/Denial** - When an admin approves or denies a user account
3. **Booking Creation** - When a booking is created
4. **Booking Updates** - When a booking is modified (by user or admin)
5. **Booking Cancellations** - When a booking is cancelled (by user or admin)
6. **Booking Reminders** - Reminder emails for upcoming bookings (24 hours before)

## Configuration

### 1. Environment Variables

Add these to your `.env` file:

```env
# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
SITE_URL=https://yourdomain.com
```

### 2. Gmail Setup (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password (not your regular Gmail password) in `EMAIL_HOST_PASSWORD`

### 3. Production Email Setup

For production, use your email provider's SMTP settings:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=noreply@yourdomain.com
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
SITE_URL=https://yourdomain.com
```

**Note:** Check your hosting provider's documentation for exact SMTP settings. Some configurations may use:
- Port 465 with SSL instead of TLS
- Different hostname format

### 4. Testing Email Configuration

Test your email setup:

```bash
cd room_booking
python manage.py shell
```

```python
from django.core.mail import send_mail
from django.conf import settings

send_mail(
    'Test Email',
    'This is a test email from GRFS Booking System.',
    settings.DEFAULT_FROM_EMAIL,
    ['your-test-email@example.com'],
    fail_silently=False,
)
```

If successful, you should receive the test email.

## Booking Reminders

### Setup Automated Reminders

The system includes a management command to send booking reminders. Set it up to run automatically:

#### Option 1: Cron Job (Linux/Mac) or Scheduled Task (Render)

Add to your crontab:

```bash
# Edit crontab
crontab -e

# Add this line to send reminders every hour (checks for bookings starting in 24 hours)
0 * * * * cd /home/username/public_html/room_booking && /home/username/virtualenv/room_booking/3.12/bin/python manage.py send_booking_reminders >> /home/username/logs/booking_reminders.log 2>&1
```

Or send reminders once daily at 9 AM:

```bash
0 9 * * * cd /home/username/public_html/room_booking && /home/username/virtualenv/room_booking/3.12/bin/python manage.py send_booking_reminders >> /home/username/logs/booking_reminders.log 2>&1
```

#### Option 2: Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., Daily at 9:00 AM)
4. Action: Start a program
5. Program: `python`
6. Arguments: `manage.py send_booking_reminders`
7. Start in: `C:\path\to\room_booking`

#### Option 3: Manual Testing

Test the reminder command:

```bash
# Dry run (doesn't send emails, just shows what would be sent)
python manage.py send_booking_reminders --dry-run

# Send reminders for bookings starting in 24 hours (default)
python manage.py send_booking_reminders

# Send reminders for bookings starting in 12 hours
python manage.py send_booking_reminders --hours=12
```

### Reminder Timing

By default, reminders are sent 24 hours before a booking starts. The command:
- Finds all approved bookings starting within a 2-hour window (e.g., 23-25 hours from now)
- Sends one reminder per booking
- Only sends reminders for approved bookings (not pending or cancelled)

## Email Templates

All email templates are defined in `booking/email_utils.py`. You can customize the email content by editing the functions:

- `send_account_creation_email()` - New account confirmation
- `send_account_approval_email()` - Account approval/denial
- `send_booking_creation_email()` - Booking creation confirmation
- `send_booking_update_email()` - Booking update notification
- `send_booking_cancellation_email()` - Booking cancellation notification
- `send_booking_reminder_email()` - Booking reminder

## Troubleshooting

### Emails Not Sending

1. **Check Environment Variables**
   ```bash
   # Verify .env file has correct values
   cat .env | grep EMAIL
   ```

2. **Check Email Settings**
   ```python
   python manage.py shell
   from django.conf import settings
   print(settings.EMAIL_HOST)
   print(settings.EMAIL_PORT)
   print(settings.EMAIL_USE_TLS)
   ```

3. **Check Logs**
   - Django logs will show email sending errors
   - Check application logs in your hosting provider's dashboard

4. **Common Issues**
   - **Gmail**: Use App Password, not regular password
   - **Hosting Provider**: Verify SMTP settings in your hosting dashboard
   - **Port Issues**: Try 587 (TLS) or 465 (SSL)
   - **Firewall**: Ensure SMTP ports are not blocked

### Reminders Not Sending

1. **Verify Cron Job is Running**
   ```bash
   # Check cron logs
   tail -f ~/logs/booking_reminders.log
   ```

2. **Test Command Manually**
   ```bash
   python manage.py send_booking_reminders --dry-run
   ```

3. **Check Booking Status**
   - Reminders only send for "Approved" bookings
   - Pending or Cancelled bookings are skipped

4. **Verify Timezone**
   - Ensure Django `TIME_ZONE` is set correctly
   - Bookings use EST/EDT timezone

## Security Notes

- **Never commit `.env` file** with email credentials
- **Use App Passwords** for Gmail (not your main password)
- **Use dedicated email account** for production (e.g., noreply@yourdomain.com)
- **Enable SPF/DKIM** records for your domain to improve email deliverability

## Production Recommendations

1. **Use Dedicated Email Service** (optional but recommended):
   - SendGrid
   - Mailgun
   - Amazon SES
   - These services provide better deliverability and analytics

2. **Configure SPF/DKIM Records**:
   - Helps prevent emails from being marked as spam
   - Contact your domain/hosting provider for setup

3. **Monitor Email Logs**:
   - Set up alerts for email sending failures
   - Review bounce rates and spam complaints

4. **Rate Limiting**:
   - The system includes basic rate limiting
   - Consider additional throttling for high-volume sites

