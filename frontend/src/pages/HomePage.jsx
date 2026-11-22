// frontend/src/pages/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-medical-light">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold text-gray-800 mb-6">
          Запишитесь к врачу онлайн
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Выберите специалиста, удобное время и получите медицинскую помощь без очередей
        </p>
        <Link to="/doctors" className="btn-primary text-lg px-8 py-3">
          Найти врача
        </Link>
      </main>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Почему выбирают нас
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="text-4xl mb-4">👨‍⚕️</div>
            <h4 className="text-xl font-bold mb-2">Опытные врачи</h4>
            <p className="text-gray-600">
              Только проверенные специалисты с многолетним опытом работы
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">⏰</div>
            <h4 className="text-xl font-bold mb-2">Удобное время</h4>
            <p className="text-gray-600">
              Выбирайте любое свободное время для записи онлайн
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">🔔</div>
            <h4 className="text-xl font-bold mb-2">Напоминания</h4>
            <p className="text-gray-600">
              Получайте уведомления о предстоящих приёмах
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;