// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Страницы
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DoctorsListPage from './pages/doctors/DoctorsListPage';
import DoctorDetailPage from './pages/doctors/DoctorDetailPage';
import ScheduleManagementPage from './pages/doctor/ScheduleManagementPage';
import DoctorDashboardPage from './pages/doctor/DoctorDashboardPage';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';
import PatientDashboardPage from './pages/patient/PatientDashboardPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage'; // 👈 НОВОЕ

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#363636', color: '#fff' } }} />

      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/doctors" element={<DoctorsListPage />} />
          <Route path="/doctors/:id" element={<DoctorDetailPage />} />

          {/* Маршруты врача */}
          <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
          <Route path="/doctor/schedule" element={<ScheduleManagementPage />} />
          <Route path="/doctor/profile" element={<DoctorProfilePage />} />

          {/* Маршруты пациента */}
          <Route path="/dashboard" element={<PatientDashboardPage />} />
          <Route path="/patient/profile" element={<PatientProfilePage />} />

          {/* 👈 НОВОЕ: Маршрут админ-панели */}
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;