from datetime import datetime, timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
import pytz
from rest_framework.test import APITestCase

from .models import Booking, Floor, Room


class RoomListViewTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="room-tester",
            email="room-tester@example.com",
            password="test-password",
        )
        floor = Floor.objects.create(name="Main Building Floor 2")
        self.active_room = Room.objects.create(
            floor=floor,
            name="Room 1",
            is_active=True,
        )
        self.inactive_room = Room.objects.create(
            floor=floor,
            name="Room 2",
            is_active=False,
        )

    def test_room_list_excludes_inactive_rooms(self):
        response = self.client.get(reverse("room-list"))

        self.assertEqual(response.status_code, 200)
        room_ids = {room["id"] for room in response.data}
        self.assertIn(self.active_room.id, room_ids)
        self.assertNotIn(self.inactive_room.id, room_ids)

    def test_floor_room_list_excludes_inactive_rooms(self):
        response = self.client.get(
            reverse("room-list"),
            {"floor": self.active_room.floor_id},
        )

        self.assertEqual(response.status_code, 200)
        room_ids = {room["id"] for room in response.data}
        self.assertEqual(room_ids, {self.active_room.id})

    def test_booking_rejects_inactive_room(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            reverse("create-booking"),
            {"room_ids": [self.inactive_room.id]},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.data["detail"],
            "Some rooms are invalid or unavailable for booking.",
        )

    def test_availability_rejects_inactive_room(self):
        response = self.client.get(
            reverse("check-availability"),
            {
                "date": "2030-01-15",
                "room_ids": str(self.inactive_room.id),
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.data["detail"],
            "Some rooms are invalid or unavailable for booking.",
        )

    def test_booking_midnight_end_is_normalized_to_1159_pm(self):
        self.client.force_authenticate(self.user)
        booking_date = timezone.localdate() + timedelta(days=30)
        next_date = booking_date + timedelta(days=1)

        response = self.client.post(
            reverse("create-booking"),
            {
                "room_ids": [self.active_room.id],
                "start_datetime": f"{booking_date.isoformat()}T20:00:00",
                "end_datetime": f"{next_date.isoformat()}T00:00:00",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201, response.data)
        booking = Booking.objects.get(pk=response.data["id"])
        local_end = timezone.localtime(booking.end_datetime)
        self.assertEqual(local_end.date(), booking_date)
        self.assertEqual(local_end.strftime("%H:%M"), "23:59")


class CampBookingWarningTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="camp-mentor",
            email="camp-mentor@example.com",
            password="test-password",
            role="mentor",
            gender="male",
        )
        floor = Floor.objects.create(name="Downstairs")
        self.room = Room.objects.create(floor=floor, name="Room 1")

    def create_camp(self, starts_in_days, status="Approved"):
        start = timezone.now() + timedelta(days=starts_in_days)
        booking = Booking.objects.create(
            user=self.user,
            start_datetime=start,
            end_datetime=start + timedelta(days=2),
            status=status,
            booking_type="camp",
        )
        booking.rooms.add(self.room)
        return booking

    def test_approved_camp_is_public_five_days_before_start(self):
        camp = self.create_camp(4)

        response = self.client.get(reverse("camp-booking-warnings"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], camp.id)
        self.assertEqual(response.data[0]["gender"], "Male")

    def test_future_and_pending_camps_are_not_shown(self):
        self.create_camp(6)
        self.create_camp(2, status="Pending")

        response = self.client.get(reverse("camp-booking-warnings"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])


class AvailableRoomsViewTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="availability-tester",
            email="availability-tester@example.com",
            password="test-password",
        )
        self.floor = Floor.objects.create(name="Upstairs")
        self.booked_room = Room.objects.create(
            floor=self.floor,
            name="Room 1",
        )
        self.free_room = Room.objects.create(
            floor=self.floor,
            name="Room 2",
        )
        self.inactive_room = Room.objects.create(
            floor=self.floor,
            name="Room 3",
            is_active=False,
        )
        self.booking_date = timezone.localdate() + timedelta(days=30)
        est = pytz.timezone("America/New_York")
        self.booking = Booking.objects.create(
            user=self.user,
            start_datetime=est.localize(
                datetime.combine(self.booking_date, datetime.min.time().replace(hour=10)),
            ),
            end_datetime=est.localize(
                datetime.combine(self.booking_date, datetime.min.time().replace(hour=12)),
            ),
            status="Approved",
        )
        self.booking.rooms.add(self.booked_room)

    def find_rooms(self, start_hour, end_hour):
        return self.client.get(
            reverse("available-rooms"),
            {
                "date": self.booking_date.isoformat(),
                "start_hour": start_hour,
                "end_hour": end_hour,
            },
        )

    def test_returns_only_rooms_free_for_entire_interval(self):
        response = self.find_rooms(11, 13)

        self.assertEqual(response.status_code, 200)
        room_ids = {room["id"] for room in response.data["available_rooms"]}
        self.assertEqual(room_ids, {self.free_room.id})

    def test_booking_that_ends_at_start_time_does_not_conflict(self):
        response = self.find_rooms(12, 13)

        self.assertEqual(response.status_code, 200)
        room_ids = {room["id"] for room in response.data["available_rooms"]}
        self.assertEqual(room_ids, {self.booked_room.id, self.free_room.id})
        self.assertNotIn(self.inactive_room.id, room_ids)

    def test_rejects_booking_longer_than_eight_hours(self):
        response = self.find_rooms(8, 17)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.data["detail"],
            "Booking duration cannot exceed 8 hours.",
        )
