// frontend/src/pages/auth/RegisterPage.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import Header from '../../components/layout/Header';

function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, loading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Следим за полем password для валидации подтверждения
  const password = watch('password');

  const onSubmit = async (data) => {
    clearError();

    // Подготавливаем данные для отправки
    const userData = {
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone || '',
      role: data.role,
      password: data.password,
      password_confirm: data.password_confirm,
    };

    const result = await registerUser(userData);

    if (result.success) {
      toast.success(result.message);
      // Редирект на страницу входа через 2 секунды
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-medical-light">
      <Header />

      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="max-w-md w-full">
          {/* Форма регистрации */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Регистрация</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Имя и Фамилия */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Имя *
                  </label>
                  <input
                    id="first_name"
                    type="text"
                    {...register('first_name', {
                      required: 'Имя обязательно для заполнения',
                      minLength: {
                        value: 2,
                        message: 'Имя должно содержать минимум 2 символа',
                      },
                    })}
                    className={`input-field ${errors.first_name ? 'border-red-500' : ''}`}
                    placeholder="Иван"
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Фамилия *
                  </label>
                  <input
                    id="last_name"
                    type="text"
                    {...register('last_name', {
                      required: 'Фамилия обязательна для заполнения',
                      minLength: {
                        value: 2,
                        message: 'Фамилия должна содержать минимум 2 символа',
                      },
                    })}
                    className={`input-field ${errors.last_name ? 'border-red-500' : ''}`}
                    placeholder="Иванов"
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
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

              {/* Телефон (необязательное поле) */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone', {
                    pattern: {
                      value: /^[+]?[\d\s-()]+$/,
                      message: 'Некорректный номер телефона',
                    },
                  })}
                  className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="+7 (999) 123-45-67"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              {/* Роль */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Я регистрируюсь как *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    watch('role') === 'patient'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      value="patient"
                      {...register('role', { required: 'Выберите роль' })}
                      className="hidden"
                    />
                    <div className="text-center">
                      <div className="text-2xl mb-1">👤</div>
                      <div className="text-sm font-medium">Пациент</div>
                    </div>
                  </label>

                  <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    watch('role') === 'doctor'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      value="doctor"
                      {...register('role', { required: 'Выберите роль' })}
                      className="hidden"
                    />
                    <div className="text-center">
                      <div className="text-2xl mb-1">👨‍⚕️</div>
                      <div className="text-sm font-medium">Врач</div>
                    </div>
                  </label>
                </div>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              {/* Пароль */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль *
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
                    pattern: {
                      value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
                      message: 'Пароль должен содержать буквы и цифры',
                    },
                  })}
                  className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Минимум 8 символов, буквы и цифры
                </p>
              </div>

              {/* Подтверждение пароля */}
              <div>
                <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700 mb-1">
                  Подтверждение пароля *
                </label>
                <input
                  id="password_confirm"
                  type="password"
                  {...register('password_confirm', {
                    required: 'Подтверждение пароля обязательно',
                    validate: (value) =>
                      value === password || 'Пароли не совпадают',
                  })}
                  className={`input-field ${errors.password_confirm ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                {errors.password_confirm && (
                  <p className="mt-1 text-sm text-red-600">{errors.password_confirm.message}</p>
                )}
              </div>

              {/* Кнопка регистрации */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
            </form>

            {/* Ссылка на вход */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Уже есть аккаунт?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Войти
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;