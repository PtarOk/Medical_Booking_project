from django.core.management.base import BaseCommand
from appointments.utils import send_daily_reminders

class Command(BaseCommand):
    help = 'Отправляет напоминания пациентам о приёме на завтра'

    def handle(self, *args, **kwargs):
        self.stdout.write("Начинаем проверку записей на завтра...")
        result = send_daily_reminders()
        self.stdout.write(self.style.SUCCESS(result))