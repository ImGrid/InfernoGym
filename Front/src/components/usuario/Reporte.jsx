import React, { useState, useEffect } from 'react';
import { fetchVideosByUser, getVideoById, deleteVideo, obtenerReportePorVideo } from '../../service/api';
import './Reporte.css'; // Utiliza un archivo CSS específico si es necesario
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function Reporte() {
    const [videos, setVideos] = useState([]);
    const navigate = useNavigate();

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
    }, []);

    const loadVideos = async () => {
        const userId = JSON.parse(localStorage.getItem('user')).userId;
        const fetchedVideos = await fetchVideosByUser(userId);
        const videosWithDetails = await Promise.all(fetchedVideos.map(async video => {
            const url = await getVideoById(video._id, 'procesado'); // Especifica que quieres el video procesado
            const reporte = await obtenerReportePorVideo(video._id); // Carga el reporte asociado al video
            return { ...video, url, ...reporte };
        }));
        setVideos(videosWithDetails);
    };

    const handleDeleteVideo = async (videoId) => {
        try {
            await deleteVideo(videoId);
            alert('Video eliminado exitosamente!');
            setVideos(prevVideos => prevVideos.filter(video => video._id !== videoId));
        } catch (error) {
            console.error("Error al eliminar video:", error);
            alert('Fallo al eliminar el video.');
        }
    };

    const handleDetails = (videoId) => {
        alert(`Mostrando detalles para el video ID: ${videoId}`);
    };

    return (
        <div className='reporte-container'>
            <div className="header-container">
                <img src="/logo_gym.png" alt="Logo del gimnasio" className="logo"/>
                <div className="button-container">
                    <button onClick={() => navigate('/usuario/modelo')}>Página Principal</button>
                    <button onClick={() => navigate('/usuario/historial')}>Ver historial</button>
                    <button onClick={() => {
                        localStorage.removeItem('user');
                        window.location.href = '/';
                    }}>Salir</button>
                </div>
            </div>
            <h1>Reporte de Progresos</h1>
            <table>
                <thead>
                    <tr>
                        <th>Video Procesado</th>
                        <th>Resultados</th>
                        <th className="comentarios">Comentarios</th>
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
                                <p>Repeticiones: {video.repeticiones}</p>
                                <p>Porcentaje de posición: {video.porcentaje_posicion.toFixed(2)}%</p>
                            </td>
                            <td className="comentarios">{video.comentarios || 'No hay comentarios'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Reporte;
