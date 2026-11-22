// frontend/src/pages/auth/LoginPage.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import Header from '../../components/layout/Header';

function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    clearError();

    const result = await login(data.email, data.password);

    if (result.success) {
      toast.success('Вход выполнен успешно!');
      navigate('/');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-medical-light">
      <Header />

      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="max-w-md w-full">
          {/* Форма входа */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Вход в систему</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'Email обязателен для заполнения',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Некорректный email адрес',
                    },
                  })}
                  className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль
                </label>
                <input
                  id="password"
                  type="password"
                  {...register('password', {
                    required: 'Пароль обязателен для заполнения',
                    minLength: {
                      value: 8,
                      message: 'Пароль должен содержать минимум 8 символов',
                    },
                  })}
                  className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Кнопка входа */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Вход...' : 'Войти'}
              </button>
            </form>

            {/* Ссылка на регистрацию */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Нет аккаунта?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;