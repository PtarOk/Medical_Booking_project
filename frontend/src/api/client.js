// frontend/src/api/client.js

import axios from 'axios';

// Базовый URL нашего Django API
const API_BASE_URL = 'http://91.202.26.162:8001/api/';

// Создаём axios-инстанс с базовыми настройками
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 секунд таймаут
});

// ============================================================
// INTERCEPTORS (перехватчики запросов и ответов)
// ============================================================

// Перехватчик запросов — добавляем JWT-токен к каждому запросу
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Перехватчик ответов — обрабатываем ошибки
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Если токен истёк (401) и мы ещё не пытались его обновить
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Пытаемся обновить токен через refresh
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
          // Нет refresh-токена — нужно войти заново
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}auth/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;

        // Сохраняем новый токен
        localStorage.setItem('access_token', newAccessToken);

        // Повторяем исходный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Не удалось обновить токен — выходим из системы
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        // Перенаправляем на страницу входа
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;