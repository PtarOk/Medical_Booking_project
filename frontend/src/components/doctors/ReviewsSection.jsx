// frontend/src/components/doctors/ReviewsSection.jsx

import React, { useState, useEffect } from 'react';
import StarRating from '../common/StarRating';
import apiClient from '../../api/client';
import useAuthStore from '../../store/authStore';

function ReviewsSection({ doctorId }) {
  const { user, isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Форма создания отзыва
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [doctorId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        apiClient.get(`/doctors/${doctorId}/reviews/`),
        apiClient.get(`/doctors/${doctorId}/rating-stats/`),
      ]);
      setReviews(reviewsRes.data.results || reviewsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Не удалось загрузить отзывы', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      alert('Пожалуйста, напишите текст отзыва');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post(`/doctors/${doctorId}/reviews/`, {
        appointment_id: window.selectedAppointmentId, // устанавливается извне
        rating: newRating,
        comment: newComment,
      });
      alert('Отзыв успешно опубликован!');
      setShowForm(false);
      setNewComment('');
      setNewRating(5);
      loadReviews();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.appointment_id?.[0] || 'Ошибка при создании отзыва');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка отзывов...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Статистика рейтинга */}
      {stats && stats.reviews_count > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-800">
                {stats.average_rating.toFixed(1)}
              </div>
              <StarRating rating={stats.average_rating} size="md" />
              <div className="text-sm text-gray-600 mt-1">
                {stats.reviews_count} {stats.reviews_count === 1 ? 'отзыв' :
                  stats.reviews_count < 5 ? 'отзыва' : 'отзывов'}
              </div>
            </div>

            <div className="flex-1 min-w-[200px]">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.rating_distribution[String(star)] || 0;
                const percent = stats.reviews_count > 0
                  ? (count / stats.reviews_count) * 100
                  : 0;
                return (
                  <div key={star} className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-600 w-8">{star}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Кнопка оставить отзыв (только для авторизованных пациентов) */}
      {isAuthenticated && user?.role === 'patient' && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          ✍️ Оставить отзыв
        </button>
      )}

      {/* Форма создания отзыва */}
      {showForm && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Ваш отзыв</h3>

          {/* Выбор записи для отзыва */}
          <div className="mb-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
            💡 Чтобы оставить отзыв, сначала выберите завершённую запись в вашем личном кабинете
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ваша оценка</label>
            <StarRating
              rating={newRating}
              size="lg"
              interactive={true}
              onRate={setNewRating}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Текст отзыва</label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              className="input-field w-full"
              placeholder="Расскажите о вашем опыте посещения..."
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmitReview}
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Отправка...' : 'Опубликовать отзыв'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="btn-secondary"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Список отзывов */}
      {reviews.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">💬</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Отзывов пока нет</h3>
          <p className="text-gray-600">Будьте первым, кто оставит отзыв об этом враче</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-gray-800">
                    {review.patient_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {review.appointment_date
                      ? new Date(review.appointment_date).toLocaleDateString('ru-RU')
                      : ''}
                  </div>
                </div>
                <StarRating rating={review.rating} size="sm" />
              </div>

              {review.comment && (
                <p className="text-gray-700 mb-3 whitespace-pre-wrap">{review.comment}</p>
              )}

              {/* Ответ врача */}
              {review.doctor_response && (
                <div className="mt-3 pl-4 border-l-4 border-primary-300 bg-primary-50 p-3 rounded">
                  <div className="text-sm font-bold text-primary-700 mb-1">
                    👨‍⚕️ Ответ врача
                  </div>
                  <p className="text-gray-700 text-sm">{review.doctor_response}</p>
                  {review.doctor_response_date && (
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(review.doctor_response_date).toLocaleDateString('ru-RU')}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewsSection;