"""
Management command to send booking reminder emails
Run this command periodically (e.g., via cron) to send reminders for upcoming bookings

Usage:
    python manage.py send_booking_reminders [--hours=24]

This will send reminders for bookings that start within the specified number of hours (default: 24)
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from booking.models import Booking
from booking.email_utils import send_booking_reminder_email
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Send reminder emails for upcoming bookings'

    def add_arguments(self, parser):
        parser.add_argument(
            '--hours',
            type=int,
            default=24,
            help='Number of hours before booking start time to send reminder (default: 24)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without actually sending emails (for testing)',
        )

    def handle(self, *args, **options):
        hours = options['hours']
        dry_run = options['dry_run']
        
        # Calculate the time window for reminders
        now = timezone.now()
        reminder_window_start = now + timedelta(hours=hours - 1)  # Start of window
        reminder_window_end = now + timedelta(hours=hours + 1)    # End of window
        
        # Find bookings that:
        # 1. Start within the reminder window
        # 2. Are approved (not pending or cancelled)
        # 3. Haven't already started
        bookings = Booking.objects.filter(
            start_datetime__gte=reminder_window_start,
            start_datetime__lte=reminder_window_end,
            status='Approved',
        ).exclude(
            start_datetime__lt=now
        ).select_related('user').prefetch_related('rooms__floor')
        
        count = bookings.count()
        self.stdout.write(f"Found {count} booking(s) to send reminders for")
        
        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN MODE - No emails will be sent"))
        
        sent_count = 0
        error_count = 0
        
        for booking in bookings:
            try:
                if not dry_run:
                    send_booking_reminder_email(booking)
                    sent_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"✓ Reminder sent for booking {booking.id} "
                            f"(User: {booking.user.email}, Start: {booking.start_datetime})"
                        )
                    )
                else:
                    self.stdout.write(
                        f"[DRY RUN] Would send reminder for booking {booking.id} "
                        f"(User: {booking.user.email}, Start: {booking.start_datetime})"
                    )
            except Exception as e:
                error_count += 1
                logger.error(f"Failed to send reminder for booking {booking.id}: {str(e)}")
                self.stdout.write(
                    self.style.ERROR(
                        f"✗ Failed to send reminder for booking {booking.id}: {str(e)}"
                    )
                )
        
        # Summary
        self.stdout.write("\n" + "="*50)
        if dry_run:
            self.stdout.write(self.style.WARNING(f"DRY RUN: Would send {count} reminder(s)"))
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully sent {sent_count} reminder(s)"
                )
            )
            if error_count > 0:
                self.stdout.write(
                    self.style.ERROR(
                        f"Failed to send {error_count} reminder(s)"
                    )
                )

