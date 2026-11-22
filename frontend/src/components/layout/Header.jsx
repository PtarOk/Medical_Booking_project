// frontend/src/components/layout/Header.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Вы вышли из системы');
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Логотип */}
        <Link to="/" className="text-2xl font-bold text-primary-600">
          Medical Booking
        </Link>

        {/* Навигация */}
        <nav className="flex items-center space-x-4 md:space-x-6">
          <Link to="/doctors" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
            Врачи
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-3 md:space-x-4">
              <span className="text-gray-700 hidden sm:block">
                Привет, <span className="font-medium text-gray-900">{user?.first_name}</span>!
              </span>

              {/* МЕНЮ ДЛЯ ПАЦИЕНТА */}
              {user?.role === 'patient' && (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                    Мои записи
                  </Link>
                  <Link to="/patient/profile" className="btn-secondary text-sm py-1.5 px-3">
                    👤 Мой профиль
                  </Link>
                </>
              )}

              {/* МЕНЮ ДЛЯ ВРАЧА */}
              {user?.role === 'doctor' && (
                <>
                  <Link to="/doctor/dashboard" className="text-gray-700 hover:text-primary-600 font-medium transition-colors hidden md:block">
                    Мои пациенты
                  </Link>
                  <Link to="/doctor/schedule" className="text-gray-700 hover:text-primary-600 font-medium transition-colors hidden md:block">
                    ⚙️ Расписание
                  </Link>
                  <Link to="/doctor/profile" className="btn-secondary text-sm py-1.5 px-3">
                    👤 Мой профиль
                  </Link>
                </>
              )}

              {/* МЕНЮ ДЛЯ АДМИНА */}
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                  🛠️ Админ-панель
                </Link>
              )}

              <button onClick={handleLogout} className="btn-danger text-sm py-1.5 px-3">
                Выйти
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-sm py-1.5 px-4">Войти</Link>
              <Link to="/register" className="btn-primary text-sm py-1.5 px-4">Регистрация</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;