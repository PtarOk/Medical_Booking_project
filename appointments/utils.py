from django.core.mail import send_mail
from django.conf import settings
from datetime import date, timedelta
from .models import Appointment

# appointments/utils.py

from django.core.mail import send_mail
from django.conf import settings
from datetime import date, timedelta
from collections import defaultdict
from .models import Appointment


def send_daily_reminders():
    """
    Находит все записи на завтра и отправляет ОДНО письмо пациенту,
    даже если у него несколько записей.
    """
    tomorrow = date.today() + timedelta(days=1)

    # Ищем записи на завтра, которые еще не отменены и по которым не отправлено напоминание
    appointments = Appointment.objects.filter(
        slot__date=tomorrow,
        status__in=[Appointment.Status.PENDING, Appointment.Status.CONFIRMED],
        reminder_sent=False
    ).select_related('patient', 'doctor__user', 'slot')

    # Группируем записи по email пациента
    patient_appointments = defaultdict(list)
    for appt in appointments:
        if appt.patient.email:
            patient_appointments[appt.patient.email].append(appt)

    sent_count = 0

    for email, appts in patient_appointments.items():
        patient = appts[0].patient

        # Формируем письмо
        subject = f"Напоминание: У вас {len(appts)} приём(а) завтра"

        message = f"Здравствуйте, {patient.first_name} {patient.last_name}!\n\n"
        message += "Напоминаем, что вы записаны на следующие приёмы:\n\n"

        for appt in appts:
            message += f"👨‍⚕️ Врач: {appt.doctor.user.first_name} {appt.doctor.user.last_name} ({appt.doctor.specialty})\n"
            message += f"📅 Дата: {appt.slot.date.strftime('%d.%m.%Y')}\n"
            message += f"⏰ Время: {appt.slot.start_time.strftime('%H:%M')}\n"
            message += f"📍 Адрес: ул. Медицинская, д. 1 (пример)\n"
            message += "-" * 30 + "\n"

        message += "\nЕсли ваши планы изменились, вы можете отменить запись в личном кабинете.\n\n"
        message += "С уважением,\nАдминистрация клиники."

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            # Помечаем ВСЕ записи пациента как отправленные
            for appt in appts:
                appt.reminder_sent = True
                appt.save()
            sent_count += 1
        except Exception as e:
            print(f"Ошибка при отправке письма на {email}: {e}")

    return f"Отправлено писем: {sent_count} (пациентам)"