# update_doctors.py

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from doctors.models import Doctor

doctors_data = [
    {
        'email': 'ivanov@medical.test',
        'experience_years': 15,
        'education': 'Воронежский государственный медицинский университет им. Н.Н. Бурденко, 2008 г.',
        'certificate_number': 'ТЕР-774123',
    },
    {
        'email': 'petrova@medical.test',
        'experience_years': 12,
        'education': 'Первый МГМУ им. И.М. Сеченова, 2011 г.',
        'certificate_number': 'КАР-889234',
    },
    {
        'email': 'sidorov@medical.test',
        'experience_years': 8,
        'education': 'Санкт-Петербургский государственный медицинский университет, 2015 г.',
        'certificate_number': 'СТО-334567',
    },
    {
        'email': 'kuznetsova@medical.test',
        'experience_years': 20,
        'education': 'Российский национальный исследовательский медицинский университет им. Н.И. Пирогова, 2003 г.',
        'certificate_number': 'НЕВ-112233',
    },
    {
        'email': 'smirnov@medical.test',
        'experience_years': 18,
        'education': 'Воронежский государственный медицинский университет им. Н.Н. Бурденко, 2005 г.',
        'certificate_number': 'ХИР-998877',
    },
]

def update_doctors():
    print("=" * 60)
    print("🔄 Обновление данных врачей...")
    print("=" * 60)
    
    updated_count = 0
    for data in doctors_data:
        email = data.pop('email')
        try:
            doctor = Doctor.objects.get(user__email=email)
            for key, value in data.items():
                setattr(doctor, key, value)
            doctor.save()
            print(f"✅ Обновлено: {doctor.user.first_name} {doctor.user.last_name} ({doctor.experience_years} лет стажа)")
            updated_count += 1
        except Doctor.DoesNotExist:
            print(f"⚠️ Не найден врач с email: {email}")
            
    print("=" * 60)
    print(f"🎉 Готово! Успешно обновлено записей: {updated_count}")
    print("=" * 60)

if __name__ == '__main__':
    update_doctors()