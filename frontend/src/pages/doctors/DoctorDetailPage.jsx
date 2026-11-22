// frontend/src/pages/doctors/DoctorDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../../components/layout/Header';
import DateSelector from '../../components/doctors/DateSelector';
import TimeSlotSelector from '../../components/doctors/TimeSlotSelector';
import AppointmentForm from '../../components/doctors/AppointmentForm';
import ReviewsSection from '../../components/doctors/ReviewsSection';
import StarRating from '../../components/common/StarRating';
import { getDoctorById, getDoctorSlots } from '../../api/doctors';
import useAuthStore from '../../store/authStore';

function DoctorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuthStore();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);

  // Загружаем информацию о враче
  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getDoctorById(id);
        setDoctor(data);
      } catch (err) {
        setError('Не удалось загрузить информацию о враче');
        toast.error('Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  // Загружаем слоты при изменении даты
  useEffect(() => {
    if (!selectedDate || !doctor) return;

    const fetchSlots = async () => {
      setSlotsLoading(true);
      setSelectedSlot(null);

      try {
        const data = await getDoctorSlots(doctor.id, selectedDate);
        setSlots(data.slots || []);

        const datesWithSlots = data.slots
          .filter((slot) => slot.is_available)
          .map((slot) => slot.date);

        setAvailableDates([...new Set(datesWithSlots)]);
      } catch (err) {
        toast.error('Не удалось загрузить расписание');
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, doctor]);

  // Обработчик успешного создания записи
  const handleAppointmentSuccess = (appointment) => {
    toast.success('Запись создана! Переход в личный кабинет...');
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  // Loading состояние
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

  // Error состояние
  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="card text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Врач не найден
            </h2>
            <p className="text-gray-600 mb-6">{error || 'Информация о враче недоступна'}</p>
            <Link to="/doctors" className="btn-primary">
              Вернуться к списку врачей
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Форматируем цену
  const formattedPrice = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(doctor.price);

  // Проверка: является ли текущий пользователь этим врачом?
  const isMyProfile =
    isAuthenticated &&
    user?.role === 'doctor' &&
    String(user.id) === String(doctor.user);

  const hasRating = Number(doctor.average_rating) > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Хлебные крошки */}
        <nav className="mb-6 text-sm">
          <Link to="/doctors" className="text-primary-600 hover:text-primary-700">
            Врачи
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">{doctor.full_name}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Левая колонка: Информация о враче */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24 p-6">
              {/* Фото врача */}
              <div className="text-center mb-4">
                {doctor.photo ? (
                  <img
                    src={doctor.photo}
                    alt={doctor.full_name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-primary-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto bg-primary-100 flex items-center justify-center border-4 border-primary-200">
                    <span className="text-5xl">👨‍⚕️</span>
                  </div>
                )}
              </div>

              {/* Информация */}
              <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
                {doctor.full_name}
              </h1>
              <p className="text-primary-600 font-medium text-center mb-4">
                {doctor.specialty}
              </p>

              {/* Рейтинг прямо под именем */}
              {hasRating && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <StarRating rating={Number(doctor.average_rating)} size="md" />
                  <span className="text-sm text-gray-600">
                    ({doctor.reviews_count} {doctor.reviews_count === 1 ? 'отзыв' :
                      doctor.reviews_count < 5 ? 'отзыва' : 'отзывов'})
                  </span>
                </div>
              )}

              {/* Детали */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  <div>
                    <p className="text-sm text-gray-600">Стоимость приёма</p>
                    <p className="font-bold text-gray-800">{formattedPrice}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">⏱️</span>
                  <div>
                    <p className="text-sm text-gray-600">Длительность</p>
                    <p className="font-bold text-gray-800">
                      {doctor.consultation_duration} минут
                    </p>
                  </div>
                </div>
                {doctor.experience_years > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎓</span>
                    <div>
                      <p className="text-sm text-gray-600">Стаж работы</p>
                      <p className="font-bold text-gray-800">
                        {doctor.experience_years} лет
                      </p>
                    </div>
                  </div>
                )}
                {doctor.education && (
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏥</span>
                    <div>
                      <p className="text-sm text-gray-600">Образование</p>
                      <p className="font-bold text-gray-800 text-sm">
                        {doctor.education}
                      </p>
                    </div>
                  </div>
                )}
                {doctor.certificate_number && (
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📜</span>
                    <div>
                      <p className="text-sm text-gray-600">Сертификат</p>
                      <p className="font-bold text-gray-800 text-sm">
                        № {doctor.certificate_number}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Описание */}
              {doctor.bio && (
                <div className="border-t pt-4 mb-4">
                  <h3 className="font-bold text-gray-800 mb-2">О враче</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {doctor.bio}
                  </p>
                </div>
              )}

              {/* Кнопка редактирования профиля (видна только самому врачу) */}
              {isMyProfile && (
                <button
                  onClick={() => navigate('/doctor/profile')}
                  className="w-full btn-secondary flex items-center justify-center gap-2 mt-2"
                >
                  ✏️ Редактировать мой профиль
                </button>
              )}
            </div>
          </div>

          {/* Правая колонка: Запись + Отзывы */}
          <div className="lg:col-span-2 space-y-6">
            {/* Проверка авторизации */}
            {!isAuthenticated && (
              <div className="card bg-yellow-50 border-2 border-yellow-200 p-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-grow">
                    <h3 className="font-bold text-yellow-800 mb-1">
                      Требуется авторизация
                    </h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      Для записи на приём необходимо войти в систему или зарегистрироваться
                    </p>
                    <div className="flex gap-2">
                      <Link to="/login" className="btn-primary text-sm">
                        Войти
                      </Link>
                      <Link to="/register" className="btn-secondary text-sm">
                        Регистрация
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Выбор даты */}
            {isAuthenticated && (
              <>
                <DateSelector
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  availableDates={availableDates}
                />

                {/* Выбор времени */}
                {selectedDate && (
                  <TimeSlotSelector
                    slots={slots}
                    selectedSlot={selectedSlot}
                    onSlotSelect={setSelectedSlot}
                    loading={slotsLoading}
                  />
                )}

                {/* Форма записи */}
                {selectedSlot && (
                  <AppointmentForm
                    doctor={doctor}
                    selectedSlot={selectedSlot}
                    onSuccess={handleAppointmentSuccess}
                  />
                )}
              </>
            )}

            {/* Секция отзывов */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Отзывы пациентов{' '}
                {doctor.reviews_count > 0 && (
                  <span className="text-gray-500 font-normal text-lg">
                    ({doctor.reviews_count})
                  </span>
                )}
              </h2>
              <ReviewsSection doctorId={doctor.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDetailPage;