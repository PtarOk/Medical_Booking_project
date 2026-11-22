// frontend/src/components/common/Pagination.jsx

import React from 'react';

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Генерируем массив страниц для отображения
  const getPages = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      {/* Кнопка "Назад" */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Назад
      </button>

      {/* Номера страниц */}
      {getPages().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
            page === currentPage
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Кнопка "Вперёд" */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Вперёд →
      </button>
    </div>
  );
}

export default Pagination;