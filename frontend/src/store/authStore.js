// frontend/src/store/authStore.js

import { create } from 'zustand';
import apiClient from '../api/client';

// Zustand store для управления состоянием авторизации
const useAuthStore = create((set) => ({
  // Состояние
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: false,
  error: null,
  
  // Действия
  
  // Вход в систему
  login: async (email, password) => {
    set({ loading: true, error: null });
    
    try {
      const response = await apiClient.post('/auth/login/', {
        email,
        password,
      });
      
      const { access, refresh, user } = response.data;
      
      // Сохраняем токены и пользователя
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        isAuthenticated: true,
        loading: false,
      });
      
      return { success: true };
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.non_field_errors?.[0] || 
                          'Ошибка входа';
      
      set({
        error: errorMessage,
        loading: false,
      });
      
      return { success: false, error: errorMessage };
    }
  },
  
  // Регистрация
  register: async (userData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await apiClient.post('/auth/register/', userData);
      
      set({ loading: false });
      
      return {
        success: true,
        data: response.data,
        message: 'Регистрация успешна! Теперь вы можете войти в систему.'
      };

    } catch (error) {
      // Обрабатываем разные типы ошибок от сервера
      let errorMessage = 'Ошибка регистрации';

      if (error.response?.data) {
        const errors = error.response.data;

        // Если есть конкретные ошибки по полям
        if (errors.email) {
          errorMessage = errors.email[0];
        } else if (errors.password) {
          errorMessage = errors.password[0];
        } else if (errors.password_confirm) {
          errorMessage = errors.password_confirm[0];
        } else if (errors.non_field_errors) {
          errorMessage = errors.non_field_errors[0];
        } else if (errors.detail) {
          errorMessage = errors.detail;
        }
      }

      set({
        error: errorMessage,
        loading: false,
      });

      return { success: false, error: errorMessage };
    }
  },

  
  // Выход из системы
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },
  
  // Обновить данные пользователя
  updateUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },
  
  // Очистить ошибку
  clearError: () => set({ error: null }),
}));

export default useAuthStore;