// frontend/src/api/doctors.js

import apiClient from './client';

// Получить список врачей с фильтрами и пагинацией
export const getDoctors = async (params = {}) => {
  try {
    const response = await apiClient.get('/doctors/', { params });
    return response.data;
  } catch (error) {
    // Логируем полную ошибку в консоль для отладки
    console.error('Ошибка при загрузке врачей:', error);
    console.error('Response data:', error.response?.data);
    console.error('Response status:', error.response?.status);
    throw error;
  }
};

// Получить профиль одного врача
export const getDoctorById = async (id) => {
  const response = await apiClient.get(`/doctors/${id}/`);
  return response.data;
};

// Получить слоты врача на дату
export const getDoctorSlots = async (id, date) => {
  const response = await apiClient.get(`/doctors/${id}/slots/`, {
    params: { date },
  });
  return response.data;
};

// Получить расписание врача
export const getDoctorSchedule = async (id) => {
  const response = await apiClient.get(`/doctors/${id}/schedule/`);
  return response.data;
};