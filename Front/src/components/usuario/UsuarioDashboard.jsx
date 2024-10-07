import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Modelo from './Modelo';
import Historial from './Historial';
import Reporte from './Reporte';
import Experimental from './Experimental';

function UsuarioDashboard() {
  return (
    <div>
      <Routes>
        <Route index element={<Navigate replace to="modelo" />} />  {/* Redirige de /usuario a /usuario/modelo */}
        <Route path="modelo" element={<Modelo />} />
        <Route path="historial" element={<Historial />} />
        <Route path="reporte" element={<Reporte />} />
        <Route path="experimental" element={<Experimental />} />  {/* Asegúrate de cerrar correctamente la etiqueta */}
      </Routes>
    </div>
  );
}

export default UsuarioDashboard;
