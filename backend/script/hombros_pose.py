import cv2
import mediapipe as mp
import numpy as np
import tensorflow as tf
import os
from tensorflow.keras.models import load_model
# Inicializar MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False, model_complexity=0, enable_segmentation=False,
                    min_detection_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# Función para extraer puntos clave
def extract_keypoints(results):
    landmarks = results.pose_landmarks.landmark

    left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y,
                     landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].z]
    left_elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                  landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y,
                  landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].z]
    left_wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                  landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y,
                  landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].z]

    right_shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                      landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y,
                      landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].z]
    right_elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                   landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y,
                   landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].z]
    right_wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                   landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y,
                   landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].z]

    return np.array([*left_shoulder, *left_elbow, *left_wrist, *right_shoulder, *right_elbow, *right_wrist])

# Función para calcular ángulos
def calculate_angle(a, b, c):
    if len(a) == 0 or len(b) == 0 or len(c) == 0:
        return None
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
        angle = 360 - angle
    return angle

# Cargar el modelo entrenado
model = load_model('../model_coord_V2.h5')

# Procesar el video
cap = cv2.VideoCapture(r'C:\Users\Lenovo\Desktop\videos_dataset\press_hombro\h3.mp4')

def _parse_function(proto):
    feature_description = {
        'features': tf.io.FixedLenFeature([9], tf.float32),
        'label': tf.io.FixedLenFeature([], tf.int64),
    }
    return tf.io.parse_single_example(proto, feature_description)

def load_tfrecord_data(tfrecord_path, label_filter=1):
    dataset = tf.data.TFRecordDataset(tfrecord_path)
    dataset = dataset.map(_parse_function)
    features_list = []
    for features in dataset:
        if features['label'].numpy() == label_filter:
            features_list.append(features['features'].numpy())
    return np.array(features_list)

def calculate_correlation(coords1, coords2):
    if coords1.ndim > 1:
        coords1 = coords1.flatten()
    if coords2.ndim > 1:
        coords2 = coords2.flatten()
    return np.corrcoef(coords1, coords2)[0, 1]

tfrecord_path = '/exercise_data.tfrecord'
ideal_movement_features = load_tfrecord_data(tfrecord_path, label_filter=1)

estado_actual_izq = 'Arriba'
estado_actual_der = 'Arriba'
repetitions_izq = 0
repetitions_der = 0

label_map = {
    2: 'Arriba_derecha',
    3: 'Abajo_derecha',
    4: 'Arriba_izquierda',
    5: 'Abajo_izquierda'
}



while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(frame_rgb)

    if results.pose_landmarks:
        mp_drawing.draw_landmarks(
            frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
            landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style())

        connection_spec = mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2)
        # Dibujar las conexiones del brazo izquierdo
        mp_drawing.draw_landmarks(
            frame,
            results.pose_landmarks,
            connections=[(mp_pose.PoseLandmark.LEFT_SHOULDER, mp_pose.PoseLandmark.LEFT_ELBOW),
                         (mp_pose.PoseLandmark.LEFT_ELBOW, mp_pose.PoseLandmark.LEFT_WRIST)],
            landmark_drawing_spec=None,
            connection_drawing_spec=connection_spec)

        # Dibujar las conexiones del brazo derecho
        mp_drawing.draw_landmarks(
            frame,
            results.pose_landmarks,
            connections=[(mp_pose.PoseLandmark.RIGHT_SHOULDER, mp_pose.PoseLandmark.RIGHT_ELBOW),
                         (mp_pose.PoseLandmark.RIGHT_ELBOW, mp_pose.PoseLandmark.RIGHT_WRIST)],
            landmark_drawing_spec=None,  # No cambiar el color de los puntos
            connection_drawing_spec=connection_spec)  # Solo cambiar las conexiones especificadas

        keypoints = extract_keypoints(results)
        if len(keypoints) == 18:
            keypoints_izq = keypoints[:9].reshape(1, 1, 9)  # Puntos del brazo izquierdo
            keypoints_der = keypoints[9:].reshape(1, 1, 9)  # Puntos del brazo derecho

            prediction_izq = model.predict(keypoints_izq, verbose=0)
            class_id_izq = np.argmax(prediction_izq)
            label_izq = label_map.get(class_id_izq, 'Desconocido')

            prediction_der = model.predict(keypoints_der, verbose=0)
            class_id_der = np.argmax(prediction_der)
            label_der = label_map.get(class_id_der, 'Desconocido')

            if estado_actual_izq == 'Abajo_izquierda' and label_izq == 'Arriba_izquierda':
                estado_actual_izq = 'Arriba_izquierda'
            elif estado_actual_izq == 'Arriba_izquierda' and label_izq == 'Abajo_izquierda':
                estado_actual_izq = 'Abajo_izquierda'
                repetitions_izq += 1

            # Actualizar el estado y contar repeticiones para el brazo derecho
            if estado_actual_der == 'Abajo_derecha' and label_der == 'Arriba_derecha':
                estado_actual_der = 'Arriba_derecha'
            elif estado_actual_der == 'Arriba_derecha' and label_der == 'Abajo_derecha':
                estado_actual_der = 'Abajo_derecha'
                repetitions_der += 1

            angle_izq = calculate_angle(keypoints_izq[0, 0, 0:3], keypoints_izq[0, 0, 3:6], keypoints_izq[0, 0, 6:9])
            elbow_x_izq = int(keypoints_izq[0, 0, 3] * frame.shape[1])
            elbow_y_izq = int(keypoints_izq[0, 0, 4] * frame.shape[0])

            # Calcular el ángulo para el brazo derecho
            angle_der = calculate_angle(keypoints_der[0, 0, 0:3], keypoints_der[0, 0, 3:6], keypoints_der[0, 0, 6:9])
            elbow_x_der = int(keypoints_der[0, 0, 3] * frame.shape[1])
            elbow_y_der = int(keypoints_der[0, 0, 4] * frame.shape[0])

            correlation = calculate_correlation(keypoints_izq[0], ideal_movement_features[0])
            similarity_percentage = correlation * 100

            cv2.putText(frame, f' {int(angle_izq)}', (elbow_x_izq, elbow_y_izq), cv2.FONT_HERSHEY_SIMPLEX,
                        1.5, (0, 0, 255), 2)  # Texto en rojo para el brazo izquierdo
            cv2.putText(frame, f' {int(angle_der)}', (elbow_x_der, elbow_y_der), cv2.FONT_HERSHEY_SIMPLEX,
                        1.5, (255, 0, 0), 2)  # Texto en azul para el brazo derecho
            # Texto para las repeticiones del brazo izquierdo
            cv2.putText(frame, f'Repeticiones Izq: {repetitions_izq}', (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1.5,
                        (0, 0, 0), 8)
            cv2.putText(frame, f'Repeticiones Izq: {repetitions_izq}', (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1.5,
                        (255, 0, 0), 2)

            # Texto para las repeticiones del brazo derecho
            cv2.putText(frame, f'Repeticiones Der: {repetitions_der}', (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 1.5,
                        (0, 0, 0), 8)
            cv2.putText(frame, f'Repeticiones Der: {repetitions_der}', (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 1.5,
                        (0, 255, 0), 2)

            cv2.putText(frame, f'Porcentaje de posicion: {similarity_percentage:.2f}%', (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 1.5,
                        (0, 0, 0), 8)
            cv2.putText(frame, f'Porcentaje de posicion: {similarity_percentage:.2f}%', (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 1.5,
                        (0, 255, 0), 2)
    # Redimensionar y mostrar el frame
    frame_resized = cv2.resize(frame, (540, 680))
    cv2.imshow('Video', frame_resized)
    if cv2.waitKey(10) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()