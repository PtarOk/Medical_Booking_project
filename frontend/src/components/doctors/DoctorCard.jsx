// frontend/src/components/doctors/DoctorCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../common/StarRating';

function DoctorCard({ doctor }) {
  const formattedPrice = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(doctor.price);

  const hasRating = Number(doctor.average_rating) > 0;

  const formatNextSlot = () => {
    if (!doctor.next_available_slot) return null;
    const d = new Date(doctor.next_available_slot.date);
    return (
      <span className="text-sm text-green-600 font-medium">
        Ближайшая запись: {d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} в {doctor.next_available_slot.start_time}
      </span>
    );
  };

  return (
    <div className="card p-5 flex items-center justify-between gap-4 hover:shadow-lg transition-shadow">
      {/* Левая часть: фото + информация */}
      <div className="flex items-center gap-4 flex-1">
        {/* Фото */}
        <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden border-2 border-primary-200 flex-shrink-0">
          {doctor.photo ? (
            <img
              src={doctor.photo}
              alt={doctor.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl">👨‍⚕️</span>
          )}
        </div>

        {/* Информация */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-800 truncate">
            {doctor.full_name}
          </h3>
          <p className="text-primary-600 font-medium mb-1">
            {doctor.specialty}
          </p>

          {/* 👇 РЕЙТИНГ */}
          {hasRating ? (
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={Number(doctor.average_rating)} size="sm" />
              <span className="text-xs text-gray-600">
                ({doctor.reviews_count} {doctor.reviews_count === 1 ? 'отзыв' :
                  doctor.reviews_count < 5 ? 'отзыва' : 'отзывов'})
              </span>
            </div>
          ) : (
            <div className="text-xs text-gray-400 mb-2 italic">
              ⭐ Отзывов пока нет
            </div>
          )}

          {/* Цена и длительность */}
          <div className="flex items-center gap-4 text-sm text-gray-700 mb-1">
            <span>💰 {formattedPrice}</span>
            <span>⏱️ {doctor.consultation_duration} мин</span>
            {doctor.experience_years > 0 && (
              <span>🎓 {doctor.experience_years} лет стажа</span>
            )}
          </div>

          {/* Ближайшая запись */}
          {formatNextSlot()}
        </div>
      </div>

      {/* Правая часть: кнопка */}
      <Link
        to={`/doctors/${doctor.id}`}
        className="btn-primary flex-shrink-0"
      >
        Записаться
      </Link>
    </div>
  );
}

export default DoctorCard;