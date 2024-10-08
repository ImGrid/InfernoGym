import os
from bson.objectid import ObjectId
fromdatabase.db import get_db
from service.reporte_service import ReporteService
from entities.video import Video
from script.sentadilla_pose import process_video as process_sentadilla
from script.bicep_pose import process_video as process_bicep
from script.tricep_pose import process_video as process_tricep
db = get_db()

class VideoService:
    @staticmethod
    def agregar_video(user_id, titulo, descripcion, path):
        """Crea y guarda un nuevo video y lo procesa según el tipo de ejercicio."""
        output_folder = r'C:\Users\Lenovo\Desktop\OP_PROJECT\backend\api\videos_process'
        output_path = os.path.join(output_folder, os.path.basename(path))
        repeticiones = 0
        porcentaje_posicion = 0

        if descripcion == 'sentadilla':
            repeticiones, porcentaje_posicion = process_sentadilla(path, output_path)
        elif descripcion == 'bicep':
            repeticiones, porcentaje_posicion = process_bicep(path, output_path)
        elif descripcion == 'triceps':
            repeticiones, porcentaje_posicion = process_tricep(path, output_path)
        else:
            raise ValueError("Descripción del ejercicio no soportada")

        # Guardar la información del video
        nuevo_video = Video(user_id, titulo, descripcion, path, path_procesado=output_path)
        video_id = nuevo_video.guardar()

        # Crear un reporte con los resultados del procesamiento
        reporte_id = ReporteService.crear_reporte(video_id, repeticiones, porcentaje_posicion, "Comentarios opcionales")

        return video_id, reporte_id

    @staticmethod
    def obtener_todos_los_videos():
        """Obtiene todos los videos de la base de datos."""
        videos = db.videos.find()
        return [{k: (str(v) if isinstance(v, ObjectId) else v) for k, v in video.items()} for video in videos]

    @staticmethod
    def obtener_videos_por_usuario(user_id):
        """Obtiene todos los videos subidos por un usuario específico."""
        return Video.obtener_videos_por_usuario(user_id)

    @staticmethod
    def buscar_video_por_id(video_id):
        """Busca un video específico por su ID."""
        return Video.buscar_video_por_id(video_id)

    @staticmethod
    def actualizar_video(video_id, cambios):
        """Actualiza la información de un video existente."""
        if not cambios:
            raise ValueError("No se proporcionaron detalles para actualizar.")
        return Video.actualizar_video(video_id, cambios)

    @staticmethod
    def eliminar_video(video_id):
        """Elimina un video específico."""
        exito, mensaje = Video.eliminar_video(video_id)
        return {"exito": exito, "mensaje": mensaje}
