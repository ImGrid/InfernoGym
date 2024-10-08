import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify'; // Importaciones añadidas
import 'react-toastify/dist/ReactToastify.css'; // Importación de CSS para toast
import { useNavigate } from 'react-router-dom';
import { uploadVideo, tokenHasExpired} from '../../service/api';
import './Modelo.css';

function Modelo() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [currentGif, setCurrentGif] = useState('bicep.gif');
    const [currentDescription, setCurrentDescription] = useState('Para grabarte realizando el ejercicio de curl de bicep con barra, primero debes grabarte de pefil izquierdo como se puede observar en el ejemplo, para que el modelo reconozca mejor tu cuerpo puedes grabarte de manera horizontal');
    const [currentExercise, setCurrentExercise] = useState('bicep');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentIcon, setCurrentIcon] = useState('');

    const navigate = useNavigate();

    const handlePreUploadCheck = () => {
        if (localStorage.getItem('noShowUploadPrompt')) return handleUpload();

        const customId = "pre-upload-check";
        toast.warn(
            <div style={{ fontSize: '16px' }}>
                Espera, antes de subir el video, ¿leíste los consejos?
                <div style={{ marginTop: '10px' }}>
                    <button style={{
                        marginRight: '5px',
                        padding: '5px 10px',
                        border: 'none',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        cursor: 'pointer',
                        borderRadius: '5px'
                    }} onClick={() => handleUploadDecision(true)}>Sí</button>
                    <button style={{
                        padding: '5px 10px',
                        border: 'none',
                        backgroundColor: '#f44336',
                        color: 'white',
                        cursor: 'pointer',
                        borderRadius: '5px'
                    }} onClick={() => handleUploadDecision(false)}>No</button>
                </div>
                <div style={{ marginTop: '10px' }}>
                    <input type="checkbox" id="noShow" name="noShow" onChange={handleCheckbox} />
                    <label htmlFor="noShow">No volver a mostrar</label>
                </div>
            </div>,
            {
                position: "top-center",
                autoClose: false,
                closeOnClick: false,
                draggable: true,
                closeButton: true,
                toastId: customId
            }
        );
    };
    const handleUploadDecision = (proceed) => {
        toast.dismiss();
        if (proceed) {
            handleUpload();
        } else {
            scrollToConsejosSection();
        }
    };

    const scrollToConsejosSection = () => {
        document.querySelector('.consejos-section').scrollIntoView({ behavior: 'smooth' });
    };

    const handleCheckbox = (e) => {
        localStorage.setItem('noShowUploadPrompt', e.target.checked ? 'true' : '');
    };
    const gifs = {
        bicep: { gif: 'bicep.gif', description: 'Para grabarte realizando el ejercicio de curl de bicep con barra, primero debes grabarte de pefil izquierdo como se puede observar en el ejemplo, para que el modelo modelo reconozca mejor tu cuerpo puedes grabarte de manera vertical como indica la figura de arriba' },
        sentadilla: { gif: 'sentadilla.gif', description: 'Para grabarte realizando el ejercicio de sentadilla, primero debes grabarte de pefil derecho como se puede observar en el ejemplo, para que el modelo modelo reconozca mejor tu cuerpo puedes grabarte de manera vertical como indica la figura de arriba' },
        hombros: { gif: 'hombros.gif', description: 'Para grabarte realizando el ejercicio de press de hombros, primero debes grabarte de frente como se puede observar en el ejemplo , para que el modelo modelo reconozca mejor tu cuerpo puedes grabarte de manera horizontal como indica la figura de arriba' },
        triceps: { gif: 'triceps.gif', description: 'Para grabarte realizando el ejercicio de triceps, primero debes grabarte de pefil derecho como se puede observar en el ejemplo, para que el modelo modelo reconozca mejor tu cuerpo puedes grabarte de manera vertical como indica la figura de arriba' }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            // Convertir bytes a MB
            const fileSizeInMB = file.size / 1024 / 1024;
            if (fileSizeInMB > 200) {
                toast.error("El archivo excede el tamaño máximo permitido de 200 MB.");
                return; // Terminar la ejecución si el archivo es demasiado grande
            }

            // Validar duración del video
            const videoURL = URL.createObjectURL(file);
            const videoElement = document.createElement('video');
            videoElement.src = videoURL;

            videoElement.addEventListener('loadedmetadata', () => {
                if (videoElement.duration > 90) {  // 90 segundos
                    toast.error("El video no debe durar más de 1 minuto y 30 segundos.");
                    URL.revokeObjectURL(videoURL);  // Limpieza
                    return;
                }
                setFile(file);
                URL.revokeObjectURL(videoURL);  // Limpieza
            });
        }
    };
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const position = window.pageYOffset;
            setScrollPosition(position);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Ajustamos la escala y la opacidad de manera más notable
    const dynamicStyle = {
        opacity: Math.max(0.3, 1 - scrollPosition / 300),  // Ajuste para hacer la transición más lenta
        transform: `scale(${Math.max(0.8, 1 - scrollPosition / 5000)})`  // Escala menos drástica
    };

    const handleUpload = async () => {
        if (!file || !currentExercise) {
            toast.error("Por favor, selecciona un archivo y un ejercicio para subir.");
            return;
        }
        setUploading(true);
        try {
            const response = await uploadVideo(file, file.name, currentExercise);
            toast.success("Video subido con éxito!");
            setFile(null);
            setCurrentGif('');
            setCurrentDescription('');
        } catch (e) {
            toast.error(e.message);
        }
        setUploading(false);
    };


    const handleExerciseClick = (exercise) => {
        setCurrentGif(gifs[exercise].gif);
        setCurrentDescription(gifs[exercise].description);
        setCurrentExercise(exercise);
        let iconPath = '';
        if (exercise === 'hombros') {
            iconPath = '/public/horizontal.png';
        } else {
            iconPath = '/public/vertical.png';
        }
        setCurrentIcon(iconPath);
    };

    const scrollToUploadSection = () => {
        document.querySelector('.upload-section').scrollIntoView({ behavior: 'smooth' });
    };
    return (
        <div className="modelo-container" style={{ background: 'radial-gradient(circle, #2A2A2A 10%, #0A0A0A 100%)' }}>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="header-container">
                <img src="/logo_gym.png" alt="Logo del gimnasio" className="logo"/>
                <div className="button-container">
                    <button onClick={() => navigate('/usuario/historial')} disabled={uploading}>Ver Historial</button>
                    <button onClick={() => navigate('/usuario/reporte')} disabled={uploading}>Ver Reportes</button>
                    <button onClick={() => {
                        if (!uploading) {  // Solo permite salir si no está cargando
                            localStorage.removeItem('user');
                            window.location.href = '/';
                        }
                    }} disabled={uploading}>Salir</button>
                </div>
            </div>
            <div className="welcome-section" style={dynamicStyle}>
                <h1>BIENVENIDO AL GIMNASIO INFERNO GYM </h1>
                <p>Empieza tu entrenamiento con nosotros y prueba el nuevo modelo de reconocimiento de postura</p>
                <button onClick={scrollToUploadSection} className="button-base probar-ahora-button">
                    Probar Ahora
                </button>
            </div>
            <div className="instruccion-section">
                <div className="instruccion-image">
                    <img src="/public/gym2.gif" alt="Instrucción" />
                    </div>
                    <div className="instruccion-text">
                        <h1>¿QUE ES LO QUE HACE EL MODELO DE RECONOCIMIENTO?</h1>
                        <p>Reconoce los puntos clave de tu cuerpo y resalta los puntos clave del ejercicio que estas realizando para indicarte la posicion correcta</p>
                </div>
            </div>
            <div className="instruccion-section">
                <div className="instruccion-image">
                    <img src="/public/gym3.gif" alt="Instrucción" />
                    </div>
                    <div className="instruccion-text">
                        <h1>¿COMO FUNCIONA POR DETRAS DEL MODELO DE RECONOCIMIENTO?</h1>
                        <p>Si te interesa probar el modelo en tiempo real puedes acceder a esta funcionalidad experimental, esta funcionalidad reconoce tu cuerpo y el ejercicio que esta realizando en tiempo real</p>

                </div>
            </div>
            <div id="uploadSection" className="upload-section">
                <div className="upload-container" onClick={() => document.getElementById('fileInput').click()}>
                    <input
                        id="fileInput"
                        type="file"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept="video/*"
                    />
                    <div className="upload-content">
                        <i className="fas fa-upload"></i>
                        <p>{file ? `Archivo seleccionado: ${file.name}` : "Haz clic para subir un archivo"}</p>
                        {uploading && <p>Cargando...</p>}
                    </div>
                </div>
                <button className="upload-button" onClick={handlePreUploadCheck}>Subir Video</button>
                <div className="exercise-button-container">
                    <button onClick={() => handleExerciseClick('bicep')} className="exercise-button">Curl de Bicep</button>
                    <button onClick={() => handleExerciseClick('sentadilla')} className="exercise-button">Sentadilla</button>
                    <button onClick={() => handleExerciseClick('hombros')} className="exercise-button">Press de Hombros</button>
                    <button onClick={() => handleExerciseClick('triceps')} className="exercise-button">Extensión de Tríceps</button>
                </div>
                <div className="gif-display">
                    {currentGif && (
                        <>
                            <img src={`/public/${currentGif}`} alt="Exercise Gif" className="exercise-gif"/>
                            <div className="exercise-description">
                                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <img src={currentIcon} alt="" className="glow-image-effect" style={{ width: '50px' }} />
                                </div>
                                <p>{currentDescription}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="consejos-section">
                <h1 className="consejos-title">Consejos Antes de Subir el Video</h1>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around' }}>
                    <div className="consejo-image-container">
                        <img src="/public/pesas.png" alt="Pesas" className="consejo-image" />
                        <p>Si no puedes grabarte solo puedes pedir ayuda a alguien para que te grabe o te diga como hacer el ejercicio</p>
                    </div>
                    <div className="consejo-image-container">
                        <img src="/public/roto.png" alt="Equipo roto" className="consejo-image" />
                        <p>No subas videos que duren mas de 2 minutos o que sean muy pesados</p>
                    </div>
                    <div className="consejo-image-container">
                        <img src="/public/oculto.png" alt="Equipo oculto" className="consejo-image" />
                        <p>Cuando te grabes trata de que no haya algún objeto entremedio que dificulte reconocer tu cuerpo</p>
                    </div>
                </div>
            </div>


            <footer className="footer-container">
                <div className="footer-map">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15230.577708809977!2d-66.19506794603272!3d-17.380834688333028!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93e3756011d6b579%3A0x94e7439fd2f0e45!2sInferno%20Gym!5e0!3m2!1ses-419!2sbo!4v1723300838965!5m2!1ses-419!2sbo"
                        width="300"
                        height="200"
                        style={{ border:0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"></iframe>
                </div>
                <div className="footer-info">
                    <div className="footer-info-left">
                        <h3>Ubicación</h3>
                        <p>Cidar Humerez 7, Cochabamba</p>
                        <h3>Horarios de atención</h3>
                        <p>- Lunes a viernes: 7:00AM a 13:00PM y 14:00PM a 22:00PM</p>
                        <p>- Sábados: 8:00AM a 13:00PM</p>
                    </div>
                    <div className="footer-info-right">
                        <h3>Contacto</h3>
                        <p>- 76956574</p>
                        <h3>Enlaces de interés</h3>
                        <p><a href="https://www.facebook.com/WinnerCbbaBolivia/?locale=es_LA" target="_blank" rel="noopener noreferrer">Winner Nutrition</a></p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Modelo;
