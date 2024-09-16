import React, { useState } from 'react';
import { updateUser, fetchUsers} from '../../service/api';
import './UpdateUserModal.css'; // Asegúrate de que el CSS esté actualizado con el estilo de fuente
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function UpdateUserModal({ user, onClose }) {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
        estado: user.estado,
        fecha_registro: user.fecha_registro,
        fecha_caducidad: user.fecha_caducidad,
        tipo: user.tipo,
        pago: user.pago
    });
    const reloadUsers = async () => {
        try {
            const newUsers = await fetchUsers();
            setUsers(newUsers);
        } catch (error) {
            console.error("Error reloading users: ", error);
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;

        if (name === 'estado') {
            finalValue = value === 'Activo' ? true : false;
        }
        if (name === 'pago' && parseFloat(value) < 0) {
            toast.error('El pago no puede ser un valor negativo.');
            return; // No actualizar el estado si el valor es negativo
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async () => {
    // Validación de campos no vacíos
        if (!formData.nombre || !formData.apellido || !formData.fecha_registro || !formData.fecha_caducidad || !formData.pago) {
            toast.error('Todos los campos son obligatorios.');
            return;
        }
        // Validar que la fecha de caducidad no sea anterior a la fecha de registro
        if (new Date(formData.fecha_caducidad) < new Date(formData.fecha_registro)) {
            toast.error('La fecha de caducidad no puede ser anterior a la fecha de registro.');
            return;
        }
        if (parseFloat(formData.pago) < 0) {
            toast.error('El pago no puede ser un valor negativo.');
            return;
        }
        try {
            await updateUser(user._id, formData);
            toast.success('Usuario actualizado exitosamente');
            onClose();
            // Llamar a una función que recargue los usuarios después de cerrar el modal
            reloadUsers();
        } catch (error) {
            console.error('Failed to update user:', error);
            toast.error('Error al actualizar usuario');
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="modal-backdrop">
                <div className="modal">
                    <h2>Actualizar Usuario</h2>
                    <div>
                        <label>NOMBRE:</label>
                        <input name="nombre" value={formData.nombre} onChange={handleChange} />
                    </div>
                    <div>
                        <label>APELLIDO:</label>
                        <input name="apellido" value={formData.apellido} onChange={handleChange} />
                    </div>
                    <div>
                        <label>ROL:</label>
                        <select name="rol" value={formData.rol} onChange={handleChange}>
                            <option value="usuario">Usuario</option>
                            <option value="entrenador">Entrenador</option>
                        </select>
                    </div>
                    <div>
                        <label>ESTADO:</label>
                        <select name="estado" value={formData.estado ? 'Activo' : 'Inactivo'} onChange={handleChange}>
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                    <div>
                        <label>FECHA REGISTRO:</label>
                        <input type="date" name="fecha_registro" value={formData.fecha_registro} onChange={handleChange} />
                    </div>
                    <div>
                        <label>FECHA CADUCIDAD:</label>
                        <input type="date" name="fecha_caducidad" value={formData.fecha_caducidad} onChange={handleChange} />
                    </div>
                    <div>
                        <label>Tipo:</label>
                        <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                            <option value="aparatos">Aparatos</option>
                            <option value="full combat">Full Combat</option>
                        </select>
                    </div>
                    <div>
                        <label>PAGO:</label>
                        <input type="number" name="pago" value={formData.pago} onChange={handleChange} min="0" required />
                    </div>
                    <button onClick={handleSubmit}>Guardar Cambios</button>
                    <button onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </>
    );
}
export default UpdateUserModal;
