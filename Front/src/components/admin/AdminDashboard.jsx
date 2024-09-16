import React from 'react';
import SidebarAdmin from './Sidebar'; // Asegúrate de que el import sea correcto según la estructura de tu proyecto
import { Routes, Route } from 'react-router-dom';
import UserTable from './UserTable';
import TrainerTable from './TrainerTable';
import CreateUserForm from './CreateUserForm';
import { useAuth } from '../../context/AuthContext'; // Asegúrate de ajustar la ruta de importación según tu estructura de directorios
function AdminDashboard() {
    return (
        <div style={{ display: 'flex' }}>
            <ProtectedSidebar />
            <div style={{ flex: 1 }}>
                <Routes>
                    <Route path="users/list" element={<UserTable />} />
                    <Route path="users/create" element={<CreateUserForm />} />
                    <Route path="users/trainer" element={<TrainerTable />} />
                </Routes>
            </div>
        </div>
    );
}

function ProtectedSidebar() {
    const { user } = useAuth(); // Uso correcto de useAuth importado desde el contexto
    if (!user || user.role !== 'administrador') return null;
    return <SidebarAdmin />;
}

export default AdminDashboard;
