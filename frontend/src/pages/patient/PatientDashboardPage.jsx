// frontend/src/pages/patient/PatientDashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../../components/layout/Header';
import apiClient from '../../api/client';
import useAuthStore from '../../store/authStore';

function PatientDashboardPage() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' или 'history'

  // Загрузка записей
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'upcoming' ? '/appointments/upcoming/' : '/appointments/history/';
      const response = await apiClient.get(endpoint);
      // DRF может вернуть массив или объект с results (из-за пагинации)
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setAppointments(data);
    } catch (err) {
      toast.error('Не удалось загрузить записи');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  // Отмена записи
  const handleCancel = async (id) => {
    if (!window.confirm('Вы уверены, что хотите отменить эту запись?')) return;

    try {
      await apiClient.patch(`/appointments/${id}/cancel/`);
      toast.success('Запись успешно отменена');
      fetchAppointments(); // Обновляем список
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Не удалось отменить запись';
      toast.error(errorMsg);
    }
  };

  // Статус-бейдж
  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      pending: 'Ожидает подтверждения',
      confirmed: 'Подтверждена',
      cancelled: 'Отменена',
      completed: 'Завершена',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Здравствуйте, {user?.first_name}! 👋
        </h1>
        <p className="text-gray-600 mb-8">Управление вашими медицинскими записями</p>

        {/* Вкладки */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'upcoming' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Предстоящие записи
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'history' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            История
          </button>
        </div>

        {/* Список записей */}
        {appointments.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {activeTab === 'upcoming' ? 'У вас нет предстоящих записей' : 'История записей пуста'}
            </h3>
            {activeTab === 'upcoming' && (
              <Link to="/doctors" className="btn-primary mt-4 inline-block">
                Найти врача и записаться
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => (
              <div key={appt.id} className="card flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-lg transition-shadow">
                {/* Информация о записи */}
                <div className="flex items-start gap-4">
                  <div className="bg-primary-50 text-primary-700 rounded-lg p-3 text-center min-w-[80px]">
                    <div className="text-2xl font-bold">
                      {appt.slot?.start_time ? appt.slot.start_time.slice(0, 5) : '--:--'}
                    </div>
                    <div className="text-xs font-medium uppercase">
                      {appt.slot?.date ? new Date(appt.slot.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : 'Дата'}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {appt.doctor?.full_name || 'Врач'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">{appt.doctor?.specialty || ''}</p>
                    {appt.notes && (
                      <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded mt-2">
                        💬 {appt.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Статус и действия */}
                <div className="flex flex-col items-end gap-3 min-w-[150px]">
                  {getStatusBadge(appt.status)}

                  {activeTab === 'upcoming' && appt.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancel(appt.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium underline"
                    >
                      Отменить запись
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientDashboardPage;