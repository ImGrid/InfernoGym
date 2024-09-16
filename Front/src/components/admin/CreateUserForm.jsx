import React, { useState } from 'react';
import { createUser } from '../../service/api'; // Importa la función desde tu módulo API
import './CreateUserForm.css'; // Estilos para el formulario
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function CreateUserForm() {
    const getFormattedDate = (date) => {
        return date.toISOString().substring(0, 10);  // Formato AAAA-MM-DD
    };

    const calculateExpiryDate = (currentDate) => {
        let newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        return getFormattedDate(newDate);
    };

    // Inicializar la fecha de registro y caducidad
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        contraseña: '',
        rol: 'usuario',
        fecha_registro: getFormattedDate(new Date()),  // Fecha actual
        fecha_caducidad: calculateExpiryDate(new Date()),  // Fecha actual + 1 mes
        tipo: 'aparatos',
        pago: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.pago < 0) {
            toast.error('El pago no puede ser un valor negativo.');
            return;
        }
        if (new Date(formData.fecha_caducidad) < new Date(formData.fecha_registro)) {
            toast.error('La fecha de caducidad no puede ser anterior a la fecha de registro.');
            return;
        }
        try {
            const result = await createUser(formData);
            toast.success(`Usuario creado con éxito`);
        } catch (error) {
            toast.error(`Error al crear usuario`);
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="create-user-header">Añadir Usuario</div>
            <div className="create-user-container">
                <form onSubmit={handleSubmit} className="create-user-form">
                    <div><label>Nombre:</label><input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required /></div>
                    <div><label>Apellido:</label><input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required /></div>
                    <div><label>Contraseña:</label><input type="password" name="contraseña" value={formData.contraseña} onChange={handleChange} required /></div>
                    <div><label>Rol:</label><select name="rol" value={formData.rol} onChange={handleChange} required><option value="usuario">Usuario</option><option value="entrenador">Entrenador</option></select></div>
                    <div><label>Fecha de Registro:</label><input type="date" name="fecha_registro" value={formData.fecha_registro} onChange={handleChange} required /></div>
                    <div><label>Fecha de Caducidad:</label><input type="date" name="fecha_caducidad" value={formData.fecha_caducidad} onChange={handleChange} required /></div>
                    <div><label>Tipo:</label><select name="tipo" value={formData.tipo} onChange={handleChange} required><option value="aparatos">Aparatos</option><option value="full combat">Full Combat</option></select></div>
                    <div><label>Pago:</label><input type="number" name="pago" value={formData.pago} onChange={handleChange} min="0" required /></div>
                    <button type="submit">Crear Usuario</button>
                </form>
            </div>
        </>
    );
}

export default CreateUserForm;
