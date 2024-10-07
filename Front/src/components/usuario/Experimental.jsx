import React, { useState, useRef, useEffect } from 'react';
import './Experimental.css';
import { processCameraFrame } from '../../service/api';
function Experimental() {
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const [isCameraActive, setIsCameraActive] = useState(false); // Estado para controlar si la cámara está activa
    const [selectedExercise, setSelectedExercise] = useState('');

    const handleToggleCamera = async () => {
        if (!isCameraActive) {
            try {
                // Activar cámara
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 920 },
                        height: { ideal: 520 }
                    }
                });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
                setIsCameraActive(true);
            } catch (err) {
                console.error('Failed to get media stream:', err);
            }
        } else {
            // Desactivar cámara
            if (stream) {
                stream.getTracks().forEach(track => track.stop()); // Detiene todas las pistas del stream
                setStream(null);
                setIsCameraActive(false);
            }
        }
    };

    const handleExerciseChange = (event) => {
        setSelectedExercise(event.target.value);
    };

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const processFrame = async () => {
        if (videoRef.current && selectedExercise === 'bicep') {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/jpeg');

            try {
                const result = await processCameraFrame(imageData);
                console.log('Processing result:', result);
            } catch (error) {
                console.error('Error processing frame:', error);
            }
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (isCameraActive) {
                processFrame();
            }
        }, 1000); // Procesar el frame cada segundo
        return () => clearInterval(interval);
    }, [isCameraActive, selectedExercise]);

    return (
        <div className="experimental-container">
            <div className="experimental-header">
                <img src="/logo_gym.png" alt="Logo del gimnasio" className="experimental-logo"/>
            </div>
            <h1>Acceso a la Cámara</h1>
            <div className="controls-container">
                <button onClick={handleToggleCamera} className="button-base">
                    {isCameraActive ? 'Desactivar Cámara' : 'Activar Cámara'}
                </button>
                <div className="exercise-select">
                    <select onChange={handleExerciseChange} className="select-exercise">
                        <option value="">Seleccionar Ejercicio</option>
                        <option value="bicep">Curl de Bíceps</option>
                        <option value="tricep">Extensión de Tríceps</option>
                        <option value="press_hombro">Press de Hombros</option>
                        <option value="sentadilla">Sentadilla</option>
                    </select>
                </div>
                <div className="video-container">
                    {stream && <video ref={videoRef} autoPlay playsInline className="video-mirror" />}
                </div>
            </div>
        </div>
    );
}

export default Experimental;
