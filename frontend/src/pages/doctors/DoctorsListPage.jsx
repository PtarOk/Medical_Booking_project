// frontend/src/pages/doctors/DoctorsListPage.jsx

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../../components/layout/Header';
import DoctorCard from '../../components/doctors/DoctorCard';
import DoctorFilters from '../../components/doctors/DoctorFilters';
import Pagination from '../../components/common/Pagination';
import { getDoctors } from '../../api/doctors';

function DoctorsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Получаем текущие параметры из URL
  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentSearch = searchParams.get('search') || '';
  const currentSpecialty = searchParams.get('specialty') || '';
  const currentOrdering = searchParams.get('ordering') || '';

  // Загружаем врачей при изменении параметров
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          page: currentPage,
          page_size: 10,
        };

        if (currentSearch) params.search = currentSearch;
        if (currentSpecialty) params.specialty = currentSpecialty;
        if (currentOrdering) params.ordering = currentOrdering;

        const data = await getDoctors(params);

        setDoctors(data.results || []);
        setTotalCount(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / 10));
      } catch (err) {
        setError('Не удалось загрузить список врачей');
        toast.error('Ошибка при загрузке врачей');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [currentPage, currentSearch, currentSpecialty, currentOrdering]);

  // Обработчик изменения фильтров
  const handleFilterChange = (newFilters) => {
    const params = {};

    if (newFilters.search) params.search = newFilters.search;
    if (newFilters.specialty) params.specialty = newFilters.specialty;
    if (newFilters.ordering) params.ordering = newFilters.ordering;
    if (newFilters.page && newFilters.page > 1) params.page = newFilters.page;

    setSearchParams(params);
  };

  // Обработчик смены страницы
  const handlePageChange = (page) => {
    const params = {};

    if (currentSearch) params.search = currentSearch;
    if (currentSpecialty) params.specialty = currentSpecialty;
    if (currentOrdering) params.ordering = currentOrdering;
    if (page > 1) params.page = page;

    setSearchParams(params);

    // Прокрутка наверх
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Наши врачи
          </h1>
          <p className="text-gray-600">
            Найдено врачей: <span className="font-medium">{totalCount}</span>
          </p>
        </div>

        {/* Фильтры */}
        <DoctorFilters
          filters={{
            search: currentSearch,
            specialty: currentSpecialty,
            ordering: currentOrdering,
          }}
          onFilterChange={handleFilterChange}
        />

        {/* Loading состояние */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        )}

        {/* Error состояние */}
        {error && !loading && (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Произошла ошибка
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Список врачей */}
        {!loading && !error && (
          <>
            {doctors.length > 0 ? (
              <div className="space-y-4">
                {doctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            ) : (
              <div className="card text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Врачи не найдены
                </h3>
                <p className="text-gray-600">
                  Попробуйте изменить параметры поиска или фильтры
                </p>
              </div>
            )}

            {/* Пагинация */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DoctorsListPage;