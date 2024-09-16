import React, { useState } from 'react';
import { actualizarReportePorVideo } from '../../service/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ComentarioModal({ isOpen, videoId, comentarioInicial, onClose }) {
    const [comentario, setComentario] = useState(comentarioInicial);

    const handleSave = async () => {
        if (!comentario) {
            toast.warn('Por favor, ingresa un comentario.');
            return;
        }
        try {
            const response = await actualizarReportePorVideo(videoId, { comentarios: comentario });
            if (response) {
                toast.success('Comentario actualizado exitosamente.');
                onClose();
            }
        } catch (error) {
            console.error('Error al actualizar el comentario:', error);
            toast.error('Error al guardar el comentario');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h2>Añade un comentario al video</h2>
                <textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Escribe tu comentario aquí..."
                />
                <div>
                    <button onClick={handleSave}>Guardar</button>
                    <button onClick={onClose}>Cancelar</button>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
}

export default ComentarioModal;
