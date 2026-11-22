// frontend/src/components/common/StarRating.jsx

import React from 'react';

const STAR_PATH = '★';

function StarRating({ rating = 0, size = 'md', interactive = false, onRate }) {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  // В интерактивном режиме (выбор оценки) — кликаем по целым звёздам
  if (interactive) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate && onRate(star)}
            className={`${sizeClasses[size]} transition-transform hover:scale-110 ${
              star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            {STAR_PATH}
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm font-medium text-gray-700">
            {Number(rating).toFixed(1)}
          </span>
        )}
      </div>
    );
  }

  // Отображение рейтинга с дробной заполненной звездой
  const clamped = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        // Сколько процентов этой звезды должно быть жёлтыми
        const fillPercent = Math.max(0, Math.min(1, clamped - (star - 1))) * 100;

        return (
          <div
            key={star}
            className={`relative inline-block ${sizeClasses[size]} leading-none`}
          >
            {/* Пустая (серая) звезда на фоне */}
            <span className="text-gray-300 select-none">{STAR_PATH}</span>

            {/* Заполненная (жёлтая) звезда сверху, обрезана по ширине */}
            <span
              className="absolute top-0 left-0 text-yellow-400 select-none overflow-hidden"
              style={{ width: `${fillPercent}%` }}
            >
              {STAR_PATH}
            </span>
          </div>
        );
      })}

      {clamped > 0 && (
        <span className="ml-2 text-sm font-medium text-gray-700">
          {clamped.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default StarRating;