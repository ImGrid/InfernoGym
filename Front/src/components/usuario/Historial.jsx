import React, { useState, useEffect } from 'react';
import { fetchVideosByUser, getVideoById, deleteVideo, eliminarReporte, obtenerReportePorVideo } from '../../service/api';
import { ToastContainer, toast } from 'react-toastify'; // Importa las funciones de toastify
import 'react-toastify/dist/ReactToastify.css'; // Importa el CSS para react-toastify
import './Historial.css';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function Historial() {
    const [videos, setVideos] = useState([]);
    const navigate = useNavigate();
    const [filter, setFilter] = useState('');
    const formatDate = (dateString) => {
        try {
            return format(parseISO(dateString), 'MM/dd/yyyy');
        } catch (error) {
            console.error("Error al formatear la fecha:", error);
            return 'Fecha no disponible';
        }
    };

    useEffect(() => {
        loadVideos();
    }, [filter]);

    const loadVideos = async () => {
        const userId = JSON.parse(localStorage.getItem('user')).userId;
        const fetchedVideos = await fetchVideosByUser(userId);
        const videosWithUrls = await Promise.all(fetchedVideos.map(async video => {
            const url = await getVideoById(video._id);
            return { ...video, url };
        }));
        setVideos(videosWithUrls);
    };

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    const handleDeleteVideo = async (videoId) => {
        try {
            const reporte = await obtenerReportePorVideo(videoId);
            if (reporte) {
                await eliminarReporte(reporte._id);
            }
            await deleteVideo(videoId);
            setVideos(prevVideos => prevVideos.filter(video => video._id !== videoId));
            toast.success('Video y reporte asociado eliminados con éxito!');
        } catch (error) {
            console.error("Error deleting video or report:", error);
            toast.error('Error al eliminar el video o el reporte.');
        }
    };

    return (
        <div className='historial-container'>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="header-container">
                <img src="/logo_gym.png" alt="Logo del gimnasio" className="logo"/>
                <div className="button-container">
                    <button onClick={() => navigate('/usuario/modelo')}>Pagina Principal</button>
                    <button onClick={() => navigate('/usuario/reporte')}>Ver Reportes</button>
                    <button onClick={() => {
                        localStorage.removeItem('user');
                        window.location.href = '/';
                    }}>Salir</button>
                </div>
            </div>
            <h1>Historial de Usuario</h1>
            <select onChange={handleFilterChange}>
                <option value="">Filtrar por</option>
                <option value="fecha">Fecha</option>
                <option value="tipo">Tipo de ejercicio</option>
            </select>
            <table className="historial-table">
                <thead>
                    <tr>
                        <th>Video</th>
                        <th>Información</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {videos.map((video, index) => (
                        <tr key={index}>
                            <td>
                                <video width="320" height="240" controls preload="metadata">
                                    <source src={video.url} type="video/mp4" />
                                </video>
                            </td>
                            <td>
                                <p>Fecha: {formatDate(video.fecha_subida)}</p>
                                <p>Descripción: {video.descripcion}</p>
                            </td>
                            <td className="actions">
                                <button onClick={() => handleDeleteVideo(video._id)}>Eliminar Video</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Historial;
