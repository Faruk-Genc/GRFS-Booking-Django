from django.db import migrations


def normalize(value):
    return " ".join((value or "").lower().split())


def rename_rooms_and_buildings(apps, schema_editor):
    Floor = apps.get_model("booking", "Floor")
    Room = apps.get_model("booking", "Room")

    for room in Room.objects.select_related("floor"):
        room_name = normalize(room.name)
        floor_name = normalize(room.floor.name)
        update_fields = []

        if "library" in room_name and (
            "downstairs" in floor_name or "first" in floor_name or "ground" in floor_name
        ):
            room.name = "Recreational Room"
            update_fields.append("name")
        elif "cafeteria" in room_name:
            room.name = "Internal Kitchen"
            update_fields.append("name")
        elif "portable" in room_name:
            room.name = "Recreational Room"
            update_fields.append("name")

        if "upstairs" in room_name and ("motel" in floor_name or "community hub" in floor_name):
            room.is_active = False
            update_fields.append("is_active")

        if update_fields:
            update_fields = list(dict.fromkeys(update_fields))
            room.save(update_fields=update_fields)

    for floor in Floor.objects.all():
        floor_name = normalize(floor.name)
        if "motel" in floor_name:
            floor.name = "Community Hub"
            floor.save(update_fields=["name"])
        elif "portable" in floor_name:
            floor.name = "Recreational Room"
            floor.save(update_fields=["name"])


class Migration(migrations.Migration):

    dependencies = [
        ("booking", "0010_normalize_midnight_booking_ends"),
    ]

    operations = [
        migrations.RunPython(rename_rooms_and_buildings, migrations.RunPython.noop),
    ]
