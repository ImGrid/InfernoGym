import React, { useState, useEffect } from 'react';
import { fetchVideosByUser, getVideoById, deleteVideo, eliminarReporte, obtenerReportePorVideo } from '../../service/api';
import { ToastContainer, toast } from 'react-toastify'; // Importa las funciones de toastify
import 'react-toastify/dist/ReactToastify.css'; // Importa el CSS para react-toastify
import './Historial.css';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function Historial() {
    const [videos, setVideos] = useState([]);
    const navigate = useNavigate();
    const [filter, setFilter] = useState('');
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showExerciseSelect, setShowExerciseSelect] = useState(false); // Nuevo estado para mostrar el select de ejercicios
    const [selectedExercise, setSelectedExercise] = useState('');
    const [showDateInputs, setShowDateInputs] = useState(false);
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
    }, [filter, startDate, endDate]);

    useEffect(() => {
        if (selectedExercise) {
            const filtered = videos.filter((video) =>
                video.descripcion.toLowerCase().includes(selectedExercise.toLowerCase())
            );
            setFilteredVideos(filtered);
        } else if (startDate && endDate) {
            // Nuevo código: Validar que la fecha "desde" no sea mayor que la fecha "hasta"
            if (isAfter(parseISO(startDate), parseISO(endDate))) {
                toast.error('La fecha "Desde" no puede ser mayor que la fecha "Hasta"'); // Mostrar mensaje de error
                setFilteredVideos(videos); // Mostrar todos los videos sin aplicar el filtro
            } else {
                // Nuevo código: Filtrar videos por el rango de fechas
                const filteredByDate = videos.filter((video) => {
                    const videoDate = parseISO(video.fecha_subida);
                    const isWithinRange = isAfter(videoDate, parseISO(startDate)) && isBefore(videoDate, parseISO(endDate));
                    return isWithinRange;
                });
                setFilteredVideos(filteredByDate);
            }
        } else {
            setFilteredVideos(videos);
        }
    }, [selectedExercise, videos, startDate, endDate]);

    const loadVideos = async () => {
        const userId = JSON.parse(localStorage.getItem('user')).userId;
        const fetchedVideos = await fetchVideosByUser(userId);
        const videosWithUrls = await Promise.all(fetchedVideos.map(async video => {
            const url = await getVideoById(video._id);
            return { ...video, url };
        }));
        setVideos(videosWithUrls);
        setFilteredVideos(videosWithUrls); //Nuevo codigo: Inicializa filteredVideos con todos los videos cargados
    };

    const handleFilterChange = (event) => {
        const selectedFilter = event.target.value;
        setFilter(selectedFilter);
        setShowDateInputs(selectedFilter === 'fecha');
        setShowExerciseSelect(selectedFilter === 'tipo'); // Muestra el botón "Seleccionar" cuando se elige "tipo"
    };
    const handleDateChange = (event) => {
        if (event.target.name === 'fecha_desde') {
            setStartDate(event.target.value);
        } else if (event.target.name === 'fecha_hasta') {
            setEndDate(event.target.value);
        }
    };
    const handleExerciseChange = (event) => {
        setSelectedExercise(event.target.value); // Cambia el ejercicio seleccionado
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
            <div className="filter-container">
                <select onChange={handleFilterChange} className="filter-button">
                    <option value="">Filtrar por</option>
                    <option value="fecha">Fecha</option>
                    <option value="tipo">Tipo de ejercicio</option>
                </select>
                {showDateInputs && (
                    <div className="date-filters">
                        <div className="date-input">
                            <label>
                                Desde:
                                <input type="date" name="fecha_desde" value={startDate} onChange={handleDateChange} />
                            </label>
                        </div>
                        <div className="date-input">
                            <label>
                                Hasta:
                                <input type="date" name="fecha_hasta" value={endDate} onChange={handleDateChange} />
                            </label>
                        </div>
                    </div>
                )}
                {showExerciseSelect && (
                    <div className="exercise-select">
                        <select onChange={handleExerciseChange} className="select-exercise">
                            <option value="">Seleccionar</option>
                            <option value="bicep">Bíceps</option>
                            <option value="tricep">Tríceps</option>
                            <option value="press_hombro">Press de hombro</option>
                            <option value="sentadilla">Sentadilla</option>
                        </select>
                    </div>
                )}
            </div>
            <table className="historial-table">
                <thead>
                    <tr>
                        <th>Video</th>
                        <th>Información</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredVideos.map((video, index) => (
                        <tr key={video._id}>
                            <td>
                                <video key={video._id} width="420" height="340" controls preload="metadata">
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
