import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import UsuarioDashboard from './components/usuario/UsuarioDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import EntrenadorDashboard from './components/entrenador/EntrenadorDashboard';

function App() {
    return (
        <AuthProvider>
            <Router>
                  <Routes>
                       <Route path="/" element={<Login />} />
                       <Route path="/usuario/*" element={<ProtectedRoute role="usuario" Component={UsuarioDashboard} />} />
                       <Route path="/admin/*" element={<ProtectedRoute role="administrador" Component={AdminDashboard} />} />
                       <Route path="/entrenador/*" element={<ProtectedRoute role="entrenador" Component={EntrenadorDashboard} />} />
                 </Routes>
            </Router>
        </AuthProvider>
    );
}

function ProtectedRoute({ role, Component }) {
    const { user, isAuthenticated } = useAuth();
    if (isAuthenticated && user.role === role) {
        return <Component />;
    } else {
        return <Navigate to="/" />;
    }
}

export default App;
