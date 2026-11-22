// frontend/src/components/doctors/TimeSlotSelector.jsx

import React from 'react';

function TimeSlotSelector({ slots, selectedSlot, onSlotSelect, loading }) {
  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Доступное время
        </h3>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Доступное время
        </h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">😕</div>
          <p className="text-gray-600">
            Нет свободных слотов на выбранную дату
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Попробуйте выбрать другую дату
          </p>
        </div>
      </div>
    );
  }

  // Разделяем слоты на свободные и занятые
  const availableSlots = slots.filter((slot) => slot.is_available);
  const unavailableSlots = slots.filter((slot) => !slot.is_available);

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Доступное время
      </h3>

      {/* Свободные слоты */}
      {availableSlots.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Свободно: {availableSlots.length} слотов
          </p>
          <div className="grid grid-cols-4 gap-2">
            {availableSlots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;

              return (
                <button
                  key={slot.id}
                  onClick={() => onSlotSelect(slot)}
                  className={`p-3 rounded-lg border-2 font-medium transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : 'border-green-300 bg-green-50 text-green-700 hover:border-green-500 hover:bg-green-100'
                  }`}
                >
                  {slot.start_time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Занятые слоты */}
      {unavailableSlots.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Занято: {unavailableSlots.length} слотов
          </p>
          <div className="grid grid-cols-4 gap-2">
            {unavailableSlots.map((slot) => (
              <div
                key={slot.id}
                className="p-3 rounded-lg border-2 border-gray-200 bg-gray-100 text-gray-400 text-center cursor-not-allowed line-through"
                title="Это время уже занято"
              >
                {slot.start_time}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Выбранный слот */}
      {selectedSlot && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">
            <span className="font-medium">Выбрано время:</span>{' '}
            {selectedSlot.start_time} - {selectedSlot.end_time}
          </p>
        </div>
      )}
    </div>
  );
}

export default TimeSlotSelector;