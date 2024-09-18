import React, { useState, useEffect } from 'react';
import { fetchVideosByUser, getVideoById, deleteVideo, obtenerReportePorVideo } from '../../service/api';
import './Reporte.css'; // Utiliza un archivo CSS específico si es necesario
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; // Nuevo código: Importa las funciones de toastify
import 'react-toastify/dist/ReactToastify.css';
function Reporte() {
    const [videos, setVideos] = useState([]);
    const navigate = useNavigate();
    const [filter, setFilter] = useState(''); // Nuevo código: Estado para el filtro
    const [filteredVideos, setFilteredVideos] = useState([]); // Nuevo código: Estado para los videos filtrados
    const [startDate, setStartDate] = useState(''); // Nuevo código: Estado para la fecha "desde"
    const [endDate, setEndDate] = useState(''); // Nuevo código: Estado para la fecha "hasta"
    const [showExerciseSelect, setShowExerciseSelect] = useState(false); // Nuevo estado para mostrar el select de ejercicios
    const [selectedExercise, setSelectedExercise] = useState(''); // Nuevo código: Estado para el ejercicio seleccionado
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
        // Nuevo código: Filtrar videos según el tipo de ejercicio seleccionado o el rango de fechas
        if (selectedExercise) {
            const filtered = videos.filter((video) =>
                video.descripcion.toLowerCase().includes(selectedExercise.toLowerCase())
            );
            setFilteredVideos(filtered);
        } else if (startDate && endDate) {
            // Validar que la fecha "desde" no sea mayor que la fecha "hasta"
            if (isAfter(parseISO(startDate), parseISO(endDate))) {
                toast.error('La fecha "Desde" no puede ser mayor que la fecha "Hasta"'); // Mostrar mensaje de error
                setFilteredVideos(videos); // Mostrar todos los videos sin aplicar el filtro
            } else {
                // Filtrar videos por el rango de fechas
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
        const videosWithDetails = await Promise.all(fetchedVideos.map(async video => {
            const url = await getVideoById(video._id, 'procesado'); // Especifica que quieres el video procesado
            const reporte = await obtenerReportePorVideo(video._id); // Carga el reporte asociado al video
            return { ...video, url, ...reporte };
        }));
        setVideos(videosWithDetails);
        setFilteredVideos(videosWithDetails); // Nuevo código: Inicializa filteredVideos con todos los videos cargados
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
            <table>
                <thead>
                    <tr>
                        <th>Video Procesado</th>
                        <th>Resultados</th>
                        <th className="comentarios">Comentarios</th>
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
