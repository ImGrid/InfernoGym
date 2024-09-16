import cv2
import mediapipe as mp
import numpy as np
import tensorflow as tf
import os
from tensorflow.keras.models import load_model
# Inicializar MediaPipe Pose
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# Función para extraer puntos clave
def extract_keypoints(results):
    landmarks = results.pose_landmarks.landmark
    hip = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x,
           landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y,
           landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].z]
    knee = [landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].x,
            landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].y,
            landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].z]
    ankle = [landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].x,
             landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].y,
             landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].z]
    return np.array([*hip, *knee, *ankle])

# Función para calcular ángulos
def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
        angle = 360 - angle
    return angle

# Cargar el modelo entrenado
model = load_model('C:/Users/Lenovo/Desktop/OP_PROJECT/PoseEstimation/dataset/model_coord_V2.h5')

def _parse_function(proto):
    feature_description = {
        'features': tf.io.FixedLenFeature([9], tf.float32),
        'label': tf.io.FixedLenFeature([], tf.int64),
    }
    return tf.io.parse_single_example(proto, feature_description)

def load_tfrecord_data(tfrecord_path, label_filter=3):
    dataset = tf.data.TFRecordDataset(tfrecord_path)
    dataset = dataset.map(_parse_function)
    features_list = []
    for features in dataset:
        if features['label'].numpy() == label_filter:
            features_list.append(features['features'].numpy())
    return np.array(features_list)

def calculate_correlation(coords1, coords2):
    # Asegurar que ambos conjuntos de coordenadas son 1D
    if coords1.ndim > 1:
        coords1 = coords1.flatten()
    if coords2.ndim > 1:
        coords2 = coords2.flatten()
    return np.corrcoef(coords1, coords2)[0, 1]
#sentadilla_script
def process_video(input_path, output_path):
    pose = mp_pose.Pose(static_image_mode=False, model_complexity=1, enable_segmentation=False,
                        min_detection_confidence=0.5)
    cap = cv2.VideoCapture(input_path)
    out = None
    tfrecord_path = 'C:/Users/Lenovo/Desktop/OP_PROJECT/PoseEstimation/dataset/csv/exercise_data.tfrecord'
    ideal_movement_features = load_tfrecord_data(tfrecord_path, label_filter=3)
    estado_actual = 'Abajo'
    repetitions = 0
    label_map = {6: 'Arriba', 7: 'Abajo'}
    total_similarity = 0
    frame_count = 0
    try:
        if not cap.isOpened():
            print("Error: No se pudo abrir el video.")
            return
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(frame_rgb)
            frame_count += 1
            if results.pose_landmarks:
                mp_drawing.draw_landmarks(
                    frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                    landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style())
                connection_spec = mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2)
                mp_drawing.draw_landmarks(
                    frame,
                    results.pose_landmarks,
                    connections=[(mp_pose.PoseLandmark.RIGHT_HIP, mp_pose.PoseLandmark.RIGHT_KNEE),
                                 (mp_pose.PoseLandmark.RIGHT_KNEE, mp_pose.PoseLandmark.RIGHT_ANKLE)],
                    landmark_drawing_spec=None,
                    connection_drawing_spec=connection_spec)
                keypoints = extract_keypoints(results)
                if len(keypoints) == 9:
                    keypoints = keypoints.reshape(1, 1, 9)
                    prediction = model.predict(keypoints, verbose=0)
                    class_id = np.argmax(prediction)
                    label = label_map.get(class_id, 'Desconocido')
                    if label in ['Arriba', 'Abajo']:
                        if estado_actual == 'Abajo' and label == 'Arriba':
                            estado_actual = 'Arriba'
                        elif estado_actual == 'Arriba' and label == 'Abajo':
                            estado_actual = 'Abajo'
                            repetitions += 1
                    angle = calculate_angle(keypoints[0, 0, 0:3], keypoints[0, 0, 3:6], keypoints[0, 0, 6:9])
                    knee_x = int(keypoints[0, 0, 3] * frame.shape[1])  # Coordenada X de la rodilla
                    knee_y = int(keypoints[0, 0, 4] * frame.shape[0])  # Coordenada Y de la rodilla
                    # Calcular la correlación con el movimiento ideal
                    correlation = calculate_correlation(keypoints[0], ideal_movement_features[0])
                    similarity_percentage = correlation * 100

                    cv2.putText(frame, f' {int(angle)}', (knee_x, knee_y), cv2.FONT_HERSHEY_SIMPLEX,
                                1.5, (0, 0, 0), 4)  # Texto en negro con borde más grueso
                    cv2.putText(frame, f' {int(angle)}', (knee_x, knee_y), cv2.FONT_HERSHEY_SIMPLEX,
                                1.5, (0, 0, 255), 2)  # Texto en rojo
                    cv2.putText(frame, f'Repeticiones: {repetitions}', (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1.5,
                                (0, 0, 0), 8)
                    cv2.putText(frame, f'Repeticiones: {repetitions}', (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1.5,
                                (255, 0, 0), 2)

                    cv2.putText(frame, f'Porcentaje de posicion: {similarity_percentage:.2f}%', (10, 150),
                                cv2.FONT_HERSHEY_SIMPLEX, 1.5,
                                (0, 0, 0), 8)
                    cv2.putText(frame, f'Porcentaje de posicion: {similarity_percentage:.2f}%', (10, 150),
                                cv2.FONT_HERSHEY_SIMPLEX, 1.5,
                                (0, 255, 0), 2)
                    total_similarity += similarity_percentage
                if out is None:
                    fourcc = cv2.VideoWriter_fourcc(*'avc1')
                    out = cv2.VideoWriter(output_path, fourcc, 20, (frame.shape[1], frame.shape[0]))
                out.write(frame)
    finally:
        cap.release()
        if out:
            out.release()
        if pose:
            pose.close()
            average_similarity = total_similarity / frame_count if frame_count > 0 else 0
            return repetitions, average_similarity