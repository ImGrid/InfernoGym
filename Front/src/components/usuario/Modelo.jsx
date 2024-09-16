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
    const [currentDescription, setCurrentDescription] = useState('Grabate a ti mismo de perfil izquierdo realizando el ejercicio de curl de bicep con barra como se muestra en el ejemplo');
    const [currentExercise, setCurrentExercise] = useState('bicep');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const navigate = useNavigate();


    const gifs = {
        bicep: { gif: 'bicep.gif', description: 'Grabate a ti mismo de perfil izquierdo realizando el ejercicio de curl de bicep con barra como se muestra en el ejemplo' },
        sentadilla: { gif: 'sentadilla.gif', description: 'Grabate a ti mismo de perfil del lado derecho para que la IA pueda calcular los puntos clave del ejercicio de sentadilla' },
        hombros: { gif: 'hombros.gif', description: 'Grabate a ti mismo de de frente realizando el ejercicio de press de hombros como se muestra en el ejemplo' },
        triceps: { gif: 'triceps.gif', description: 'Grabate a ti mismo de perfil derecho realizando el ejercicio de extension de triceps en polea como se muestra en el ejemplo' }
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
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
            toast.error(e.message); // Mostrar el mensaje de error retornado por la API o la función de expiración del token
        }
        setUploading(false);
    };


    const handleExerciseClick = (exercise) => {
        setCurrentGif(gifs[exercise].gif);
        setCurrentDescription(gifs[exercise].description);
        setCurrentExercise(exercise);
    };
    const scrollToUploadSection = () => {
        document.querySelector('.upload-section').scrollIntoView({ behavior: 'smooth' });
    };
    return (
        <div className="modelo-container">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="header-container">
                <img src="/logo_gym.png" alt="Logo del gimnasio" className="logo"/>
                <div className="button-container">
                    <button onClick={() => navigate('/usuario/historial')}>Ver Historial</button>
                    <button onClick={() => navigate('/usuario/reporte')}>Ver Reportes</button>
                    <button onClick={() => {
                        localStorage.removeItem('user');
                        window.location.href = '/';
                    }}>Salir</button>
                </div>
            </div>
            <div className="welcome-section">
                <h1>BIENVENIDO AL GIMNASIO INFERNO GYM </h1>
                <p>Empieza tu entrenamiento con nosotros, grabate realizando los ejercicios disponibles y subiendolos a la pagina para ser procesados con IA</p>
                <button onClick={scrollToUploadSection} className="button-base probar-ahora-button">
                    Probar Ahora
                </button>
            </div>
            <div className="instruccion-section">
                <h1>¿COMO USAR EL MODELO DE IA?</h1>
                <p>Con tu celular o algun dispositivo grabate realizando los 4 ejercicios que estan disponibles, ya sea del lado izquierdo o derecho como indica el ejemplo, recuerda grabarte desde un angulo que se vea todo tu cuerpo</p>
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
                <button className="upload-button" onClick={handleUpload}>Subir Video</button>
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
                            <p className="exercise-description">{currentDescription}</p>
                        </>
                    )}
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
