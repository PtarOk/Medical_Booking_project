// frontend/src/pages/patient/PatientProfilePage.jsx

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Header from '../../components/layout/Header';
import apiClient from '../../api/client';
import useAuthStore from '../../store/authStore';

function PatientProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [personal, setPersonal] = useState({
    first_name: '',
    last_name: '',
    patronymic: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/auth/me/');
      setPersonal({
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        patronymic: res.data.patronymic || '',
        phone: res.data.phone || '',
        date_of_birth: res.data.date_of_birth || '',
        gender: res.data.gender || '',
        address: res.data.address || '',
        emergency_contact_name: res.data.emergency_contact_name || '',
        emergency_contact_phone: res.data.emergency_contact_phone || '',
      });
    } catch (err) {
      toast.error('Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiClient.patch('/auth/me/', personal);
      updateUser({ ...user, ...res.data });
      toast.success('Профиль успешно обновлён!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('Новые пароли не совпадают');
      return;
    }
    try {
      await apiClient.post('/auth/change-password/', {
        old_password: passwords.old_password,
        new_password: passwords.new_password,
      });
      toast.success('Пароль изменён');
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
      setShowPasswordForm(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка смены пароля');
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
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Мой профиль 👤</h1>
        <p className="text-gray-600 mb-8">{user?.email} · Роль: пациент</p>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Основные данные */}
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Личные данные</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
                <input
                  type="text"
                  value={personal.last_name}
                  onChange={(e) => setPersonal({ ...personal, last_name: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                <input
                  type="text"
                  value={personal.first_name}
                  onChange={(e) => setPersonal({ ...personal, first_name: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Отчество</label>
                <input
                  type="text"
                  value={personal.patronymic}
                  onChange={(e) => setPersonal({ ...personal, patronymic: e.target.value })}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Дата рождения</label>
                <input
                  type="date"
                  value={personal.date_of_birth}
                  onChange={(e) => setPersonal({ ...personal, date_of_birth: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Пол</label>
                <select
                  value={personal.gender}
                  onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="">Не указан</option>
                  <option value="M">Мужской</option>
                  <option value="F">Женский</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
              <input
                type="tel"
                value={personal.phone}
                onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                className="input-field w-full"
                placeholder="+7 999 000-00-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Адрес проживания</label>
              <input
                type="text"
                value={personal.address}
                onChange={(e) => setPersonal({ ...personal, address: e.target.value })}
                className="input-field w-full"
                placeholder="Город, улица, дом, квартира"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input-field w-full bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email изменить нельзя</p>
            </div>
          </div>

          {/* Экстренный контакт */}
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2">🚨 Экстренный контакт</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ФИО контактного лица</label>
                <input
                  type="text"
                  value={personal.emergency_contact_name}
                  onChange={(e) => setPersonal({ ...personal, emergency_contact_name: e.target.value })}
                  className="input-field w-full"
                  placeholder="Иванов Иван Иванович"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон контактного лица</label>
                <input
                  type="tel"
                  value={personal.emergency_contact_phone}
                  onChange={(e) => setPersonal({ ...personal, emergency_contact_phone: e.target.value })}
                  className="input-field w-full"
                  placeholder="+7 999 000-00-00"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full py-3 text-lg disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : '💾 Сохранить изменения'}
          </button>
        </form>

        {/* Смена пароля */}
        <div className="card p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Безопасность</h2>
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="btn-secondary text-sm"
            >
              🔐 Сменить пароль
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Текущий пароль</label>
                <input
                  type="password"
                  value={passwords.old_password}
                  onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Новый пароль</label>
                <input
                  type="password"
                  value={passwords.new_password}
                  onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                  className="input-field w-full"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Повторите новый пароль</label>
                <input
                  type="password"
                  value={passwords.confirm_password}
                  onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-sm">Сменить пароль</button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="btn-secondary text-sm"
                >
                  Отмена
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientProfilePage;