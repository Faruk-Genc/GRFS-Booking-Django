from datetime import time, timedelta

from django.db import migrations
from django.utils import timezone


def normalize_midnight_booking_ends(apps, schema_editor):
    Booking = apps.get_model("booking", "Booking")

    for booking in Booking.objects.exclude(
        start_datetime=None,
    ).exclude(end_datetime=None).iterator():
        local_start = timezone.localtime(booking.start_datetime)
        local_end = timezone.localtime(booking.end_datetime)

        if local_end.time() == time.min and local_end.date() > local_start.date():
            Booking.objects.filter(pk=booking.pk).update(
                end_datetime=booking.end_datetime - timedelta(minutes=1)
            )


class Migration(migrations.Migration):

    dependencies = [
        ("booking", "0009_room_is_active"),
    ]

    operations = [
        migrations.RunPython(
            normalize_midnight_booking_ends,
            migrations.RunPython.noop,
        ),
    ]
