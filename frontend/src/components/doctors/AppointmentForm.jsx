// frontend/src/components/doctors/AppointmentForm.jsx

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiClient from '../../api/client';

function AppointmentForm({ doctor, selectedSlot, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    if (!selectedSlot) {
      toast.error('Пожалуйста, выберите время');
      return;
    }

    setLoading(true);

    try {
      const appointmentData = {
        doctor_id: doctor.id,
        slot_id: selectedSlot.id,
        notes: data.notes || '',
      };

      const response = await apiClient.post('/appointments/', appointmentData);

      toast.success('Запись успешно создана!');
      reset();

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      // Выводим полную ошибку в консоль для отладки
      console.error("ПОЛНАЯ ОШИБКА ОТ БЭКЕНДА:", error.response?.data || error.message);

      // Пытаемся вытащить понятное сообщение
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.slot_id?.[0] ||
        error.response?.data?.doctor_id?.[0] ||
        error.response?.data?.detail ||
        'Не удалось создать запись. Проверьте консоль.';

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Подтверждение записи
      </h3>

      {/* Информация о записи */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Врач:</span>
            <span className="font-medium">{doctor.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Специальность:</span>
            <span className="font-medium">{doctor.specialty}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Стоимость:</span>
            <span className="font-medium">
              {new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                maximumFractionDigits: 0,
              }).format(doctor.price)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Длительность:</span>
            <span className="font-medium">{doctor.consultation_duration} мин</span>
          </div>
        </div>
      </div>

      {/* Форма */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Примечания */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Примечания (необязательно)
          </label>
          <textarea
            id="notes"
            {...register('notes', {
              maxLength: {
                value: 500,
                message: 'Максимум 500 символов',
              },
            })}
            rows="4"
            className="input-field resize-none"
            placeholder="Опишите ваши симптомы или жалобы..."
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Эта информация поможет врачу подготовиться к приёму
          </p>
        </div>

        {/* Кнопка отправки */}
        <button
          type="submit"
          disabled={loading || !selectedSlot}
          className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Создание записи...' : 'Подтвердить запись'}
        </button>
      </form>
    </div>
  );
}

export default AppointmentForm;