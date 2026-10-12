from django.db import migrations


def add_classrooms(apps, schema_editor):
    Floor = apps.get_model('booking', 'Floor')
    Room = apps.get_model('booking', 'Room')
    alias = schema_editor.connection.alias
    hub = Floor.objects.using(alias).filter(name__iexact='Community Hub').first()
    if hub is None:
        hub = Floor.objects.using(alias).create(name='Community Hub')
    for name in ['Classroom 1', 'Classroom 2']:
        Room.objects.using(alias).get_or_create(floor=hub, name=name, defaults={'is_active': True})


class Migration(migrations.Migration):
    dependencies = [('booking', '0011_rename_rooms_and_buildings')]
    operations = [migrations.RunPython(add_classrooms, migrations.RunPython.noop)]
