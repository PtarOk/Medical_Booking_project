// frontend/src/pages/doctor/DoctorDashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../../components/layout/Header';
import apiClient from '../../api/client';
import useAuthStore from '../../store/authStore';

function DoctorDashboardPage() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [doctorProfileId, setDoctorProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');

  // Загрузка записей
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/appointments/');
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setAppointments(data);
    } catch (err) {
      toast.error('Не удалось загрузить записи');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка ID профиля текущего врача
  const fetchDoctorProfile = async () => {
    try {
      // Пробуем эндпоинт /me/ (который мы только что создали на бэкенде)
      const response = await apiClient.get('/doctors/me/');
      setDoctorProfileId(response.data.id);
    } catch (err) {
      // Fallback: ищем по email среди всех врачей, если /me/ вдруг не сработает
      try {
        const response = await apiClient.get('/doctors/');
        const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
        const myProfile = data.find(
          (d) => d.email === user?.email || d.user === user?.id
        );
        if (myProfile) {
          setDoctorProfileId(myProfile.id);
        }
      } catch (e) {
        console.error('Не удалось загрузить профиль врача', e);
      }
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDoctorProfile();
  }, []);

  // Действия с записью
  const handleAction = async (id, action, successMsg) => {
    if (action === 'cancel' && !window.confirm('Отменить эту запись?')) return;

    try {
      await apiClient.patch(`/appointments/${id}/${action}/`);
      toast.success(successMsg);
      fetchAppointments(); // Обновляем список
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка при изменении статуса');
    }
  };

  // Фильтрация для вкладок
  const todayStr = new Date().toISOString().split('T')[0];
  const filteredAppointments = appointments.filter((a) => {
    if (activeTab === 'today') return a.slot?.date === todayStr;
    if (activeTab === 'upcoming') return a.slot?.date >= todayStr && a.status !== 'cancelled';
    if (activeTab === 'pending') return a.status === 'pending';
    return true; // 'all'
  }).sort((a, b) => {
    // Сортировка по дате и времени
    const dateA = a.slot?.date + 'T' + a.slot?.start_time;
    const dateB = b.slot?.date + 'T' + b.slot?.start_time;
    return dateA.localeCompare(dateB);
  });

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      pending: 'Ожидает',
      confirmed: 'Подтверждена',
      cancelled: 'Отменена',
      completed: 'Завершена'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${styles[status]}`}>
        {labels[status]}
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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Кабинет врача 👨‍⚕️</h1>
        <p className="text-gray-600 mb-8">Добро пожаловать, {user?.first_name} {user?.last_name}</p>

        {/* Быстрые ссылки */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Ссылка на РЕДАКТИРОВАНИЕ профиля */}
          <Link
            to="/doctor/profile"
            className="card hover:shadow-lg transition-shadow flex items-center gap-4 border-l-4 border-blue-500"
          >
            <div className="text-3xl">📝</div>
            <div>
              <h3 className="font-bold text-gray-800">Мой профиль</h3>
              <p className="text-sm text-gray-600">Редактировать данные, специальность и цены</p>
            </div>
          </Link>

          {/* Ссылка на управление расписанием */}
          <Link
            to="/doctor/schedule"
            className="card hover:shadow-lg transition-shadow flex items-center gap-4 border-l-4 border-primary-500"
          >
            <div className="text-3xl">📅</div>
            <div>
              <h3 className="font-bold text-gray-800">Управление расписанием</h3>
              <p className="text-sm text-gray-600">Настроить часы работы и сгенерировать слоты</p>
            </div>
          </Link>
        </div>

        {/* Ссылка на публичный просмотр (если ID уже загрузился) */}
        {doctorProfileId && (
          <div className="mb-8 text-right">
            <Link
              to={`/doctors/${doctorProfileId}`}
              className="text-sm text-primary-600 hover:underline flex items-center justify-end gap-1"
            >
              👁️ Посмотреть, как меня видят пациенты →
            </Link>
          </div>
        )}

        {/* Вкладки */}
        <div className="flex gap-2 mb-6 border-b overflow-x-auto">
          {[
            { id: 'today', label: 'Сегодня' },
            { id: 'upcoming', label: 'Предстоящие' },
            { id: 'pending', label: 'Ожидают подтверждения' },
            { id: 'all', label: 'Все записи' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Список записей */}
        {filteredAppointments.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Записей нет</h3>
            <p className="text-gray-600">В этой категории пока нет пациентов</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((appt) => (
              <div
                key={appt.id}
                className="card flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-gray-100 text-gray-700 rounded-lg p-3 text-center min-w-[80px]">
                    <div className="text-xl font-bold">
                      {appt.slot?.start_time ? appt.slot.start_time.slice(0, 5) : '--:--'}
                    </div>
                    <div className="text-xs font-medium">
                      {appt.slot?.date
                        ? new Date(appt.slot.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
                        : ''}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {appt.patient?.first_name && appt.patient?.last_name
                        ? `${appt.patient.first_name} ${appt.patient.last_name}`
                        : (appt.patient_name || 'Пациент')}
                    </h3>
                    {appt.notes && (
                      <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                        💬 {appt.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-3 min-w-[200px]">
                  {getStatusBadge(appt.status)}

                  <div className="flex gap-2">
                    {appt.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(appt.id, 'confirm', 'Запись подтверждена')}
                          className="btn-primary text-sm py-1 px-3"
                        >
                          ✓ Подтвердить
                        </button>
                        <button
                          onClick={() => handleAction(appt.id, 'cancel', 'Запись отменена')}
                          className="btn-danger text-sm py-1 px-3"
                        >
                          ✕ Отменить
                        </button>
                      </>
                    )}
                    {appt.status === 'confirmed' && (
                      <button
                        onClick={() => handleAction(appt.id, 'complete', 'Приём завершён')}
                        className="btn-secondary text-sm py-1 px-3 border-green-500 text-green-700 hover:bg-green-50"
                      >
                        ✓ Завершить приём
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboardPage;