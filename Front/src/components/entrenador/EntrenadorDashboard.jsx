import React from 'react';
import HistorialEntrenador from './HistorialEntrenador';
import { Routes, Route, Navigate } from 'react-router-dom';
function EntrenadorDashboard() {
  return (
    <div>
      <Routes>
        <Route index element={<Navigate replace to="historial" />} />
        <Route path="historial" element={<HistorialEntrenador />} />
      </Routes>
    </div>
  );
}

export default EntrenadorDashboard;
