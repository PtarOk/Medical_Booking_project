// frontend/src/pages/doctor/ScheduleManagementPage.jsx

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Header from '../../components/layout/Header';
import apiClient from '../../api/client';
import useAuthStore from '../../store/authStore';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Понедельник' },
  { value: 1, label: 'Вторник' },
  { value: 2, label: 'Среда' },
  { value: 3, label: 'Четверг' },
  { value: 4, label: 'Пятница' },
  { value: 5, label: 'Суббота' },
  { value: 6, label: 'Воскресенье' },
];

// Формат "09:00:00" -> "09:00" для input type=time
const toInputTime = (val) => (val ? val.slice(0, 5) : '');

function ScheduleManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [schedules, setSchedules] = useState({});
  const [consultationDuration, setConsultationDuration] = useState(30);

  // ============================================================
  // ЗАГРУЗКА расписания (с учётом пагинации!)
  // ============================================================
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await apiClient.get('/doctor-schedules/');

        // DRF пагинирует: данные в response.data.results
        const list = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        // Инициализируем ВСЕ 7 дней: рабочие из БД, остальные — нерабочие
        const initial = {};
        DAYS_OF_WEEK.forEach((d) => {
          initial[d.value] = {
            day_of_week: d.value,
            is_working_day: false,
            start_time: '09:00',
            end_time: '18:00',
            break_start: '',
            break_end: '',
          };
        });

        list.forEach((s) => {
          initial[s.day_of_week] = {
            ...initial[s.day_of_week],
            is_working_day: s.is_working_day,
            start_time: toInputTime(s.start_time) || '09:00',
            end_time: toInputTime(s.end_time) || '18:00',
            break_start: toInputTime(s.break_start),
            break_end: toInputTime(s.break_end),
          };
        });

        setSchedules(initial);
      } catch (err) {
        console.error('Ошибка загрузки расписания:', err);
        toast.error('Не удалось загрузить расписание');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const handleScheduleChange = (dayOfWeek, field, value) => {
    setSchedules((prev) => ({
      ...prev,
      [dayOfWeek]: { ...prev[dayOfWeek], [field]: value },
    }));
  };

  // ============================================================
  // СОХРАНЕНИЕ — одним запросом на update-weekly
  // ============================================================
  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      const payload = {
        schedules: Object.values(schedules).map((s) => ({
          day_of_week: s.day_of_week,
          is_working_day: s.is_working_day,
          start_time: s.start_time,
          end_time: s.end_time,
          break_start: s.break_start || null,
          break_end: s.break_end || null,
        })),
      };

      const response = await apiClient.put(
        '/doctor-schedules/update-weekly/',
        payload
      );

      toast.success(response.data.message || 'Расписание сохранено!');
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      toast.error(
        err.response?.data?.error || 'Не удалось сохранить расписание'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSlots = async () => {
    setGenerating(true);
    try {
      const response = await apiClient.post('/doctor/generate-slots/', {
        days_ahead: 30,
      });
      toast.success(`✅ ${response.data.message}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Не удалось сгенерировать слоты');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Управление расписанием
        </h1>
        <p className="text-gray-600 mb-8">
          Настройте рабочие часы, и система автоматически создаст слоты для записи
        </p>

        {/* Длительность приёма */}
        <div className="card mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Длительность приёма
          </h3>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={consultationDuration}
              onChange={(e) => setConsultationDuration(e.target.value)}
              min={15}
              max={120}
              step={15}
              className="input-field w-32"
            />
            <span className="text-gray-700">минут</span>
          </div>
        </div>

        {/* Рабочие часы */}
        <div className="card mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Рабочие часы</h3>

          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day) => {
              const schedule = schedules[day.value] || {};
              const isWorking = schedule.is_working_day === true;

              return (
                <div
                  key={day.value}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isWorking
                      ? 'border-primary-200 bg-primary-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={isWorking}
                      onChange={(e) =>
                        handleScheduleChange(day.value, 'is_working_day', e.target.checked)
                      }
                      className="w-5 h-5 text-primary-600 rounded"
                    />
                    <span className="font-medium text-gray-800">{day.label}</span>
                  </label>

                  {isWorking && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ml-8">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Начало</label>
                        <input
                          type="time"
                          value={schedule.start_time}
                          onChange={(e) => handleScheduleChange(day.value, 'start_time', e.target.value)}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Конец</label>
                        <input
                          type="time"
                          value={schedule.end_time}
                          onChange={(e) => handleScheduleChange(day.value, 'end_time', e.target.value)}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Обед (начало)</label>
                        <input
                          type="time"
                          value={schedule.break_start}
                          onChange={(e) => handleScheduleChange(day.value, 'break_start', e.target.value)}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Обед (конец)</label>
                        <input
                          type="time"
                          value={schedule.break_end}
                          onChange={(e) => handleScheduleChange(day.value, 'break_end', e.target.value)}
                          className="input-field"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 mt-6 pt-6 border-t">
            <button
              onClick={handleSaveSchedule}
              disabled={saving}
              className="btn-primary px-6 py-2 disabled:opacity-50"
            >
              {saving ? 'Сохранение...' : '💾 Сохранить расписание'}
            </button>
            <button
              onClick={handleGenerateSlots}
              disabled={generating}
              className="btn-secondary px-6 py-2 disabled:opacity-50"
            >
              {generating ? 'Генерация...' : '⚡ Сгенерировать слоты на 30 дней'}
            </button>
          </div>
        </div>

        <div className="card bg-blue-50 border-2 border-blue-200">
          <h3 className="font-bold text-blue-800 mb-2">💡 Как это работает</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
            <li>Отметьте галочкой рабочие дни (у нерабочих галочки быть не должно)</li>
            <li>Укажите время начала/конца и обед</li>
            <li>Нажмите "Сохранить расписание"</li>
            <li>Нажмите "Сгенерировать слоты"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default ScheduleManagementPage;