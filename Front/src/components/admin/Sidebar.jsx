import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src="/logo_usuario.png" alt="Logo Usuario" />
        <h3>Bienvenido, Administrador</h3>
      </div>
      <ul>
        <li>
          <Link to="/admin/users/list">
            <img src="/lista.png" alt="Lista" className="icon" /> Usuarios
          </Link>
        </li>
        <li>
          <Link to="/admin/users/trainer">
            <img src="/lista.png" alt="Ícono Entrenadores" className="icon" /> Entrenadores
          </Link>
        </li>
        <li>
          <Link to="/admin/users/create">
            <img src="/añadir.png" alt="Añadir" className="icon" /> Añadir Usuario
          </Link>
        </li>
      </ul>
      <div className="logout-section">
        <button className="logout-button" onClick={handleLogout}>
          <img src="/salir.png" alt="Ícono Salir" className="logout-icon" /> Salir
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
