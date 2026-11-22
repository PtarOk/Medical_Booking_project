// frontend/src/pages/admin/AdminDashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import apiClient from '../../api/client';
import useAuthStore from '../../store/authStore';

function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    users: 0,
    doctors: 0,
    appointments: 0,
    reviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Получаем статистику через существующие API
      const [doctorsRes, usersRes] = await Promise.all([
        apiClient.get('/doctors/?page_size=1'),
        apiClient.get('/auth/me/'), // просто проверка авторизации
      ]);

      setStats({
        doctors: doctorsRes.data.count || 0,
        users: 0, // можно добавить отдельный эндпоинт
        appointments: 0,
        reviews: 0,
      });
    } catch (err) {
      console.error('Не удалось загрузить статистику', err);
    } finally {
      setLoading(false);
    }
  };

  const adminSections = [
    {
      title: '👥 Пользователи',
      description: 'Управление пациентами, врачами и администраторами',
      url: '/admin/users/user/',
      color: 'border-blue-500',
      icon: '👥',
    },
    {
      title: '👨‍⚕️ Врачи',
      description: 'Профили врачей, специальностей и рейтингов',
      url: '/admin/doctors/doctor/',
      color: 'border-green-500',
      icon: '👨‍⚕️',
    },
    {
      title: '📅 Расписания',
      description: 'Рабочие часы и временные слоты врачей',
      url: '/admin/doctors/schedule/',
      color: 'border-purple-500',
      icon: '📅',
    },
    {
      title: '📋 Записи',
      description: 'Все записи на приём и их статусы',
      url: '/admin/appointments/appointment/',
      color: 'border-orange-500',
      icon: '📋',
    },
    {
      title: '⭐ Отзывы',
      description: 'Модерация отзывов и ответы врачей',
      url: '/admin/reviews/review/',
      color: 'border-yellow-500',
      icon: '⭐',
    },
    {
      title: '🔐 Группы и права',
      description: 'Управление правами доступа и группами',
      url: '/admin/auth/group/',
      color: 'border-red-500',
      icon: '🔐',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🛠️ Админ-панель
          </h1>
          <p className="text-gray-600">
            Добро пожаловать, {user?.first_name} {user?.last_name}! Управление системой Medical Booking
          </p>
        </div>

        {/* Статистика */}
        {loading ? (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="card p-6 border-l-4 border-blue-500">
              <div className="text-sm text-gray-600 mb-1">Всего врачей</div>
              <div className="text-3xl font-bold text-gray-800">{stats.doctors}</div>
            </div>
            <div className="card p-6 border-l-4 border-green-500">
              <div className="text-sm text-gray-600 mb-1">Записей на приём</div>
              <div className="text-3xl font-bold text-gray-800">{stats.appointments}</div>
            </div>
            <div className="card p-6 border-l-4 border-yellow-500">
              <div className="text-sm text-gray-600 mb-1">Отзывов</div>
              <div className="text-3xl font-bold text-gray-800">{stats.reviews}</div>
            </div>
            <div className="card p-6 border-l-4 border-purple-500">
              <div className="text-sm text-gray-600 mb-1">Пользователей</div>
              <div className="text-3xl font-bold text-gray-800">—</div>
            </div>
          </div>
        )}

        {/* Разделы админки */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Разделы управления</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {adminSections.map((section) => (
            <a
              key={section.title}
              href={section.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`card p-6 hover:shadow-lg transition-shadow border-l-4 ${section.color} group`}
            >
              <div className="text-3xl mb-2">{section.icon}</div>
              <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-primary-600 transition-colors">
                {section.title}
              </h3>
              <p className="text-sm text-gray-600">{section.description}</p>
              <div className="mt-3 text-xs text-primary-600 font-medium">
                Открыть →
              </div>
            </a>
          ))}
        </div>

        {/* Кнопка перехода в Django Admin */}
        <div className="card p-6 bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                🚀 Полная админ-панель Django
              </h3>
              <p className="text-gray-600 text-sm">
                Перейти в стандартную админку Django со всеми возможностями
              </p>
            </div>
            <a
              href="/admin/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-lg px-6 py-3"
            >
              Открыть Django Admin →
            </a>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Быстрые действия</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              to="/doctors"
              className="card p-5 hover:shadow-md transition-shadow flex items-center gap-3"
            >
              <span className="text-2xl">👁️</span>
              <div>
                <div className="font-bold text-gray-800">Просмотреть сайт</div>
                <div className="text-sm text-gray-600">Как видят пациенты</div>
              </div>
            </Link>
            <a
              href="/admin/users/user/add/"
              target="_blank"
              rel="noopener noreferrer"
              className="card p-5 hover:shadow-md transition-shadow flex items-center gap-3"
            >
              <span className="text-2xl">➕</span>
              <div>
                <div className="font-bold text-gray-800">Добавить пользователя</div>
                <div className="text-sm text-gray-600">Создать нового админа/врача</div>
              </div>
            </a>
            <a
              href="/admin/doctors/doctor/add/"
              target="_blank"
              rel="noopener noreferrer"
              className="card p-5 hover:shadow-md transition-shadow flex items-center gap-3"
            >
              <span className="text-2xl">👨‍⚕️</span>
              <div>
                <div className="font-bold text-gray-800">Добавить врача</div>
                <div className="text-sm text-gray-600">Создать профиль специалиста</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;