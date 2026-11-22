// frontend/src/components/doctors/DateSelector.jsx

import React from 'react';

function DateSelector({ selectedDate, onDateChange }) {
  // Генерируем даты на ближайшие 14 дней
  const generateDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateStr = date.toISOString().split('T')[0];

      dates.push({
        date: dateStr,
        day: date.getDate(),
        month: date.toLocaleDateString('ru-RU', { month: 'short' }),
        weekday: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
        isToday: i === 0,
      });
    }

    return dates;
  };

  const dates = generateDates();

  const handleDateClick = (dateStr) => {
    onDateChange(dateStr);
  };

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Выберите дату
      </h3>

      <div className="grid grid-cols-7 gap-2">
        {dates.map((dateInfo) => {
          const isSelected = selectedDate === dateInfo.date;

          return (
            <button
              key={dateInfo.date}
              onClick={() => handleDateClick(dateInfo.date)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 bg-white hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              <div className="text-xs font-medium uppercase">
                {dateInfo.weekday}
              </div>
              <div className="text-2xl font-bold my-1">
                {dateInfo.day}
              </div>
              <div className="text-xs">
                {dateInfo.month}
              </div>
              {dateInfo.isToday && (
                <div className="text-xs text-primary-600 font-medium mt-1">
                  Сегодня
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-4 p-3 bg-primary-50 rounded-lg">
          <p className="text-sm text-primary-700">
            <span className="font-medium">Выбрана дата:</span>{' '}
            {new Date(selectedDate).toLocaleDateString('ru-RU', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      )}
    </div>
  );
}

export default DateSelector;