from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

from django.utils import timezone


VENUE_TIMEZONE = ZoneInfo('America/Toronto')


def weekend_school_conflicts(rooms, start, end):
    """Find a Saturday 9–3 school reservation overlapping an interval."""
    if not start or not end or end <= start:
        return []
    if timezone.is_naive(start):
        start = timezone.make_aware(start, VENUE_TIMEZONE)
    if timezone.is_naive(end):
        end = timezone.make_aware(end, VENUE_TIMEZONE)
    local_start = start.astimezone(VENUE_TIMEZONE)
    saturday = local_start.date() + timedelta(days=(5 - local_start.weekday()) % 7)
    school_start = datetime.combine(saturday, time(9), tzinfo=VENUE_TIMEZONE)
    school_end = datetime.combine(saturday, time(15), tzinfo=VENUE_TIMEZONE)
    if start >= school_end:
        saturday += timedelta(days=7)
        school_start = datetime.combine(saturday, time(9), tzinfo=VENUE_TIMEZONE)
        school_end = datetime.combine(saturday, time(15), tzinfo=VENUE_TIMEZONE)
    if not (start < school_end and end > school_start):
        return []
    return [
        {
            'room_id': room.id, 'room_name': room.name,
            'existing_start': school_start.isoformat(),
            'existing_end': school_end.isoformat(), 'reason': 'Weekend School',
        }
        for room in rooms
        if room.name.strip().lower() in ('classroom 1', 'classroom 2')
        and room.floor.name.strip().lower() == 'community hub'
    ]
