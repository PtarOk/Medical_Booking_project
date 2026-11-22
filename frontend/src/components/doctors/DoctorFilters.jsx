// frontend/src/components/doctors/DoctorFilters.jsx

import React, { useState, useEffect } from 'react';

// Список специальностей — значения ДОЛЖНЫ совпадать с тем, что в БД (на русском!)
const SPECIALTIES = [
  { value: '', label: 'Все специальности' },
  { value: 'Терапевт', label: 'Терапевт' },
  { value: 'Кардиолог', label: 'Кардиолог' },
  { value: 'Стоматолог', label: 'Стоматолог' },
  { value: 'Невролог', label: 'Невролог' },
  { value: 'Офтальмолог', label: 'Офтальмолог' },
  { value: 'Хирург', label: 'Хирург' },
  { value: 'Педиатр', label: 'Педиатр' },
  { value: 'ЛОР', label: 'ЛОР' },
  { value: 'Дерматолог', label: 'Дерматолог' },
];

function DoctorFilters({ filters, onFilterChange }) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  // Дебаунс для поиска — отправляем запрос через 500мс после остановки ввода
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFilterChange({ ...filters, search: localSearch, page: 1 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, filters, onFilterChange]);

  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value, page: 1 });
  };

  return (
    <div className="card mb-6 p-5">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Фильтры и сортировка</h3>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Поиск по имени */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Поиск
          </label>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Имя, фамилия или специальность..."
            className="input-field w-full"
          />
        </div>

        {/* Специальность */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Специальность
          </label>
          <select
            value={filters.specialty || ''}
            onChange={(e) => handleChange('specialty', e.target.value)}
            className="input-field w-full"
          >
            {SPECIALTIES.map((spec) => (
              <option key={spec.value} value={spec.value}>
                {spec.label}
              </option>
            ))}
          </select>
        </div>

        {/* Сортировка */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Сортировка
          </label>
          <select
            value={filters.ordering || ''}
            onChange={(e) => handleChange('ordering', e.target.value)}
            className="input-field w-full"
          >
            <option value="">По умолчанию</option>
            <option value="price">💰 Цена: по возрастанию</option>
            <option value="-price">💰 Цена: по убыванию</option>
            <option value="-average_rating">⭐ По рейтингу (высокий → низкий)</option>
            <option value="-experience_years">🎓 По стажу (больше → меньше)</option>
            <option value="-created_at">🆕 Сначала новые</option>
          </select>
        </div>
      </div>

      {/* Сброс фильтров */}
      {(filters.search || filters.specialty || filters.ordering) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              setLocalSearch('');
              onFilterChange({ page: 1 });
            }}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
          >
            ✕ Сбросить все фильтры
          </button>
        </div>
      )}
    </div>
  );
}

export default DoctorFilters;