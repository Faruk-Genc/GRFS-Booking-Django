from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from .models import Floor, Room


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
