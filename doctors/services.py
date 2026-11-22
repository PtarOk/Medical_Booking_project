# doctors/services.py

from datetime import datetime, timedelta
from django.utils import timezone
from .models import Schedule, TimeSlot


def generate_slots_for_doctor(doctor, days_ahead=30):
    """
    Генерирует временные слоты для врача на N дней вперёд
    на основе его расписания (Schedule) и длительности приёма.

    Возвращает кортеж: (количество созданных слотов, сообщение)
    """
    slots_created = 0

    today = timezone.now().date()
    end_date = today + timedelta(days=days_ahead)

    # Получаем расписание врача (только рабочие дни)
    schedules = Schedule.objects.filter(doctor=doctor, is_working_day=True)

    if not schedules.exists():
        return 0, "У врача нет настроенного расписания"

    # Создаём словарь расписания: день_недели → объект Schedule
    schedule_dict = {s.day_of_week: s for s in schedules}

    # Проходим по каждому дню в заданном диапазоне
    current_date = today
    while current_date <= end_date:
        day_of_week = current_date.weekday()  # 0=Пн, 6=Вс

        # Проверяем, работает ли врач в этот день недели
        if day_of_week not in schedule_dict:
            current_date += timedelta(days=1)
            continue

        schedule = schedule_dict[day_of_week]

        # Генерируем слоты для этого конкретного дня
        slots_created_today = generate_slots_for_day(
            doctor=doctor,
            date=current_date,
            start_time=schedule.start_time,
            end_time=schedule.end_time,
            break_start=schedule.break_start,
            break_end=schedule.break_end,
            duration=doctor.consultation_duration,
        )

        slots_created += slots_created_today
        current_date += timedelta(days=1)

    return slots_created, f"Успешно создано {slots_created} новых слотов"


def generate_slots_for_day(doctor, date, start_time, end_time,
                           break_start=None, break_end=None, duration=30):
    """
    Генерирует слоты для одного конкретного дня.
    Возвращает количество созданных слотов.
    """
    slots_created = 0

    # Преобразуем время в datetime для удобной арифметики
    current_time = datetime.combine(date, start_time)
    end_datetime = datetime.combine(date, end_time)

    # Время обеда (если указано)
    break_start_dt = None
    break_end_dt = None
    if break_start and break_end:
        break_start_dt = datetime.combine(date, break_start)
        break_end_dt = datetime.combine(date, break_end)

    # Длительность одного слота
    slot_duration = timedelta(minutes=duration)

    # Генерируем слоты циклом
    while current_time + slot_duration <= end_datetime:
        slot_start = current_time.time()
        slot_end = (current_time + slot_duration).time()

        # 1. Проверка: не попадает ли слот на обеденный перерыв
        if break_start_dt and break_end_dt:
            slot_start_dt = current_time
            slot_end_dt = current_time + slot_duration

            # Если слот пересекается с обедом — пропускаем его
            if slot_start_dt < break_end_dt and slot_end_dt > break_start_dt:
                current_time += slot_duration
                continue

        # 2. Проверка: не создаём ли мы слот в прошлом (актуально для сегодняшнего дня)
        if date == timezone.now().date():
            slot_datetime = timezone.make_aware(datetime.combine(date, slot_start))
            if slot_datetime <= timezone.now():
                current_time += slot_duration
                continue

        # 3. Создание слота
        # ВАЖНО: используем get_or_create, а не update_or_create!
        # Это защищает уже занятые пациентами слоты от сброса в is_available=True
        slot, created = TimeSlot.objects.get_or_create(
            doctor=doctor,
            date=date,
            start_time=slot_start,
            defaults={
                'end_time': slot_end,
                'is_available': True,
            }
        )

        if created:
            slots_created += 1

        # Переходим к следующему временному интервалу
        current_time += slot_duration

    return slots_created