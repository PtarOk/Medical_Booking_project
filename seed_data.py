# update_patients.py

import os
import django

# Настраиваем окружение Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

# Данные для обновления пациентов
patients_data = [
    {
        'email': 'anna@mail.ru',
        'patronymic': 'Александровна',
        'date_of_birth': '1990-05-15',
        'gender': 'F',
        'address': 'г. Воронеж, ул. Ленина, д. 10, кв. 5',
        'emergency_contact_name': 'Смирнов Александр Иванович (муж)',
        'emergency_contact_phone': '+7 (900) 111-22-33',
    },
    {
        'email': 'dmitry@mail.ru',
        'patronymic': 'Сергеевич',
        'date_of_birth': '1985-11-20',
        'gender': 'M',
        'address': 'г. Воронеж, пр-т Революции, д. 45, кв. 12',
        'emergency_contact_name': 'Волкова Мария Петровна (супруга)',
        'emergency_contact_phone': '+7 (900) 222-33-44',
    },
    {
        'email': 'elena@mail.ru',
        'patronymic': 'Владимировна',
        'date_of_birth': '1992-08-03',
        'gender': 'F',
        'address': 'г. Воронеж, ул. Кольцовская, д. 22, кв. 8',
        'emergency_contact_name': 'Новиков Владимир Дмитриевич (отец)',
        'emergency_contact_phone': '+7 (900) 333-44-55',
    },
    {
        'email': 'sergey@mail.ru',
        'patronymic': 'Андреевич',
        'date_of_birth': '1978-02-14',
        'gender': 'M',
        'address': 'г. Воронеж, ул. 20-летия Октября, д. 100, кв. 45',
        'emergency_contact_name': 'Морозова Анна Сергеевна (дочь)',
        'emergency_contact_phone': '+7 (900) 444-55-66',
    },
    {
        'email': 'olga@mail.ru',
        'patronymic': 'Игоревна',
        'date_of_birth': '1995-12-30',
        'gender': 'F',
        'address': 'г. Воронеж, Ленинский проспект, д. 15, кв. 3',
        'emergency_contact_name': 'Соколов Игорь Владимирович (брат)',
        'emergency_contact_phone': '+7 (900) 555-66-77',
    },
    {
        'email': 'nikita@mail.ru',
        'patronymic': 'Павлович',
        'date_of_birth': '2000-07-10',
        'gender': 'M',
        'address': 'г. Воронеж, ул. Плехановская, д. 5, кв. 1',
        'emergency_contact_name': 'Лебедева Елена Николаевна (мать)',
        'emergency_contact_phone': '+7 (900) 666-77-88',
    },
]


def update_patients():
    print("=" * 60)
    print("🔄 Обновление данных пациентов...")
    print("=" * 60)

    updated_count = 0

    for data in patients_data:
        email = data.pop('email')  # Извлекаем email для поиска

        try:
            # Находим пользователя с ролью пациента
            user = User.objects.get(email=email, role='patient')

            # Обновляем поля
            for key, value in data.items():
                setattr(user, key, value)

            user.save()
            print(f"✅ Обновлено: {user.last_name} {user.first_name} {user.patronymic}")
            updated_count += 1

        except User.DoesNotExist:
            print(f"⚠️ Не найден пациент с email: {email}")

    print("=" * 60)
    print(f"🎉 Готово! Успешно обновлено записей: {updated_count}")
    print("=" * 60)


if __name__ == '__main__':
    update_patients()