import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Modelo from './Modelo';
import Historial from './Historial';
import Reporte from './Reporte';

function UsuarioDashboard() {
  return (
    <div>
      <Routes>
        <Route index element={<Navigate replace to="modelo" />} />
        <Route path="modelo" element={<Modelo />} />
        <Route path="historial" element={<Historial />} />
        <Route path="reporte" element={<Reporte />} />
      </Routes>
    </div>
  );
}

export default UsuarioDashboard;
