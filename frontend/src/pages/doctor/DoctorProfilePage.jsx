// frontend/src/pages/doctor/DoctorProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../../components/layout/Header';
import apiClient from '../../api/client';
import useAuthStore from '../../store/authStore';

function DoctorProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Личные данные (из /auth/me/)
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

  // Врачебные данные (из /doctors/me/)
  const [doctor, setDoctor] = useState({
    specialty: '',
    bio: '',
    price: '',
    consultation_duration: 30,
    is_available: true,
    experience_years: 0,
    education: '',
    certificate_number: '',
  });

  // Смена пароля
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
      const [meRes, docRes] = await Promise.all([
        apiClient.get('/auth/me/'),
        apiClient.get('/doctors/me/'),
      ]);

      setPersonal({
        first_name: meRes.data.first_name || '',
        last_name: meRes.data.last_name || '',
        patronymic: meRes.data.patronymic || '',
        phone: meRes.data.phone || '',
        date_of_birth: meRes.data.date_of_birth || '',
        gender: meRes.data.gender || '',
        address: meRes.data.address || '',
        emergency_contact_name: meRes.data.emergency_contact_name || '',
        emergency_contact_phone: meRes.data.emergency_contact_phone || '',
      });

      setDoctor({
        specialty: docRes.data.specialty || '',
        bio: docRes.data.bio || '',
        price: docRes.data.price || '',
        consultation_duration: docRes.data.consultation_duration || 30,
        is_available: docRes.data.is_available ?? true,
        experience_years: docRes.data.experience_years || 0,
        education: docRes.data.education || '',
        certificate_number: docRes.data.certificate_number || '',
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
      // 1. Сохраняем личные данные
      const meRes = await apiClient.patch('/auth/me/', personal);
      updateUser({ ...user, ...meRes.data });

      // 2. Сохраняем врачебные данные (включая новые поля)
      await apiClient.patch('/doctors/me/', {
        specialty: doctor.specialty,
        bio: doctor.bio,
        price: doctor.price,
        consultation_duration: Number(doctor.consultation_duration),
        is_available: doctor.is_available,
        experience_years: Number(doctor.experience_years),
        education: doctor.education,
        certificate_number: doctor.certificate_number,
      });

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Мой профиль 👨‍⚕️</h1>
          <Link to={`/doctors/${doctor.id || ''}`} className="text-sm text-primary-600 hover:underline">
            👁️ Как меня видят пациенты →
          </Link>
        </div>
        <p className="text-gray-600 mb-8">
          {user?.email} · Роль: врач
        </p>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Личные данные */}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-field w-full bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Врачебная информация */}
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Врачебная информация</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Специальность</label>
                <input
                  type="text"
                  value={doctor.specialty}
                  onChange={(e) => setDoctor({ ...doctor, specialty: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Стаж работы (лет)</label>
                <input
                  type="number"
                  min="0"
                  value={doctor.experience_years}
                  onChange={(e) => setDoctor({ ...doctor, experience_years: e.target.value })}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Образование / ВУЗ</label>
              <input
                type="text"
                value={doctor.education}
                onChange={(e) => setDoctor({ ...doctor, education: e.target.value })}
                className="input-field w-full"
                placeholder="Например: МГМУ им. Сеченова, 2010 г."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Номер сертификата</label>
              <input
                type="text"
                value={doctor.certificate_number}
                onChange={(e) => setDoctor({ ...doctor, certificate_number: e.target.value })}
                className="input-field w-full"
                placeholder="№ 123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">О себе</label>
              <textarea
                value={doctor.bio}
                onChange={(e) => setDoctor({ ...doctor, bio: e.target.value })}
                rows={4}
                className="input-field w-full"
                placeholder="Расскажите о своём опыте, подходах к лечению..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Стоимость приёма (₽)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={doctor.price}
                  onChange={(e) => setDoctor({ ...doctor, price: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Длительность приёма (мин)</label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={doctor.consultation_duration}
                  onChange={(e) => setDoctor({ ...doctor, consultation_duration: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={doctor.is_available}
                onChange={(e) => setDoctor({ ...doctor, is_available: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Принимаю пациентов (виден в общем списке)</span>
            </label>
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

export default DoctorProfilePage;