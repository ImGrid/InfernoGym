import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../service/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';

function Login() {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const data = await loginUser(nombre, apellido, password);
            login({ username: `${nombre} ${apellido}`, role: data.rol, token: data.access_token, userId: data.userId });

            switch (data.rol) {
                case 'usuario':
                    navigate('/usuario');
                    break;
                case 'administrador':
                    navigate('/admin');
                    break;
                case 'entrenador':
                    navigate('/entrenador');
                    break;
                default:
                    navigate('/');
            }
        } catch (error) {
            console.error('Login failed:', error);
            toast.error('Error al iniciar sesión. Verifica tu nombre, apellido y contraseña.', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    return (
        <div className="login-container">
            <ToastContainer />
            <div className="login-form-container">
                <form className="login-form" onSubmit={handleLogin}>
                    <h1>Iniciar sesión</h1>
                    <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
                    <input type="text" placeholder="Apellido" value={apellido} onChange={e => setApellido(e.target.value)} />
                    <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
                    <button type="submit">Iniciar Sesión</button>
                </form>
            </div>
        </div>
    );
}

export default Login;
