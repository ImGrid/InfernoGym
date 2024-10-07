import React, { useState, useEffect } from 'react';
import { fetchVideosByUser, getVideoById, deleteVideo, obtenerReportePorVideo, fetchUsers } from '../../service/api';
import './HistorialEntrenador.css';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ComentarioModal from './ComentarioModal';
import { toast } from 'react-toastify';

function HistorialEntrenador() {
    const [videos, setVideos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [viewedTimes, setViewedTimes] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const navigate = useNavigate();
    const formatDate = (dateString) => {
        try {
            return format(parseISO(dateString), 'MM/dd/yyyy');
        } catch (error) {
            console.error("Error al formatear la fecha:", error);
            return 'Fecha no disponible';
        }
    };
    const [modalOpen, setModalOpen] = useState(false);
    const [activeVideoId, setActiveVideoId] = useState(null);
    const [activeReport, setActiveReport] = useState(null);

    useEffect(() => {
        if (selectedUserId) {
            loadVideos(selectedUserId);
        }
    }, [selectedUserId]);

    useEffect(() => {
        if (searchTerm) {
            fetchUsersByName(searchTerm);
        } else {
            setSearchResults([]);
        }
    }, [searchTerm]);

    const handleUserSelect = (userId, name, lastName) => {
        setSelectedUserId(userId);
        setSearchTerm(`${name} ${lastName}`);  // Actualiza searchTerm con el nombre completo
        setSearchResults([]);  // Limpia los resultados de búsqueda
    };

    const fetchUsersByName = async (name) => {
        try {
            const allUsers = await fetchUsers();
            const filteredUsers = allUsers.filter(user =>
                user.nombre.toLowerCase().includes(name.toLowerCase()) && user.rol === 'usuario'
            );
            setSearchResults(filteredUsers);
        } catch (error) {
            console.error("error encontrando usuario", error);
        }
    };


    const loadVideos = async (userId) => {
        const fetchedVideos = await fetchVideosByUser(userId);
        const initialTimes = {};
        fetchedVideos.forEach(video => {
            initialTimes[video._id] = false;  // Inicializa todos los videos como no vistos
        });
        setViewedTimes(initialTimes);  // Establece los tiempos de visualización iniciales

        if (fetchedVideos && fetchedVideos.length > 0) {
            const videosWithDetails = await Promise.all(fetchedVideos.map(async video => {
                const url = await getVideoById(video._id, 'procesado');
                const reporte = await obtenerReportePorVideo(video._id);
                return { ...video, url, ...reporte, video_id: video._id };
            }));
            setVideos(videosWithDetails);
        } else {
            setVideos([]);
        }
    };
    const handleVideoPlay = (videoId) => {
        setTimeout(() => {
            setViewedTimes(prev => ({ ...prev, [videoId]: true }));  // Marca el video como visto después de 30 segundos
        }, 10000);
    };

    const handleAddComments = (videoId) => {
        if (!viewedTimes[videoId]) {
            toast.warning('Debes ver al menos 30 segundos del video antes de comentar.');
            return;
        }

        const reporte = videos.find(video => video.video_id === videoId);
        if (reporte) {
            setActiveReport(reporte);
            setActiveVideoId(videoId);
            setModalOpen(true);
        } else {
            alert('No se pudo cargar el reporte del video.');
        }
    };

    return (
        <div className='historial-entrenador-container'>
            <div className="entrenador-header-container">
                <img src="/logo_gym.png" alt="Logo del gimnasio" className="entrenador-logo"/>
                <input
                    className="search-input"
                    type="text"
                    placeholder="Buscar usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="exit-button" onClick={() => {
                    localStorage.removeItem('user');
                    window.location.href = '/';
                }}>Salir</button>
                {searchResults.length > 0 && (
                    <ul className="search-results">
                        {searchResults.map(user => (
                            <li key={user._id} onClick={() => handleUserSelect(user._id, user.nombre, user.apellido)}>
                                {user.nombre} {user.apellido}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <h1>Historial de Usuarios</h1>
            <table>
                <thead>
                    <tr>
                        <th>Video Procesado</th>
                        <th>Información</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {videos.map((video, index) => (
                        <tr key={index}>
                            <td>
                                <video width="320" height="240" controls onPlay={() => handleVideoPlay(video.video_id)}>
                                    <source src={video.url} type="video/mp4" />
                                </video>
                            </td>
                            <td>
                                <p>Fecha: {formatDate(video.fecha_subida)}</p>
                                <p>Descripción: {video.descripcion}</p>
                                <p>Repeticiones: {video.repeticiones}</p>
                                <p>Porcentaje de posición: {video.porcentaje_posicion.toFixed(2)}%</p>
                            </td>
                            <td className="actions">
                                <button disabled={!viewedTimes[video.video_id]} onClick={() => handleAddComments(video.video_id)}>Añadir Comentarios</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {modalOpen && activeReport && (
                <ComentarioModal
                    isOpen={modalOpen}
                    videoId={activeVideoId}
                    comentarioInicial={activeReport.comentarios}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
}

export default HistorialEntrenador;
