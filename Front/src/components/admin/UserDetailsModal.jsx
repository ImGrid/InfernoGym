import React, { useState } from 'react';
import { deleteUser } from '../../service/api';
import UpdateUserModal from './UpdateUserModal'; // Asegúrate de importar el nuevo componente
import './UserDetailsModal.css';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

function UserDetailsModal({ user, onClose }) {
    const [showUpdate, setShowUpdate] = useState(false);
    const MySwal = withReactContent(Swal);
    const handleDelete = async () => {
        const result = await MySwal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, estoy seguro',
            cancelButtonText: 'Cancelar'
        });

        if (result.value) {
            try {
                await deleteUser(user._id);
                toast.success("Usuario eliminado con éxito");
                onClose(); // Cerrar el modal después de borrar
            } catch (error) {
                console.error('Failed to delete user:', error);
                toast.error("Error al eliminar el usuario");
            }
        }
    };

    const handleUpdate = () => {
        setShowUpdate(true);
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="modal-backdrop">
                <div className="modal">
                    <h2>Detalles del Usuario</h2>
                    <p><strong>Nombre:</strong> {user.nombre} {user.apellido}</p>
                    <p><strong>Rol:</strong> {user.rol}</p>
                    <p><strong>Estado:</strong> {user.estado ? 'Activo' : 'Inactivo'}</p>
                    <p><strong>Fecha de Registro:</strong> {user.fecha_registro}</p>
                    <p><strong>Fecha de Caducidad:</strong> {user.fecha_caducidad}</p>
                    <p><strong>Tipo:</strong> {user.tipo}</p>
                    <p><strong>Pago:</strong> {user.pago}</p>
                    <button className="delete-button" onClick={handleDelete}>Borrar</button>
                    <button onClick={handleUpdate}>Actualizar</button>
                    <button onClick={onClose}>Cerrar</button>
                    {showUpdate && <UpdateUserModal user={user} onClose={() => setShowUpdate(false)} />}
                </div>
            </div>
        </>
    );
}

export default UserDetailsModal;