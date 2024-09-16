from backend.database.db import get_db
from datetime import datetime
from bson.objectid import ObjectId
db = get_db()

class Video:
    def __init__(self, user_id, titulo, descripcion, path, path_procesado=None, fecha_subida=None):
        self.user_id = ObjectId(user_id)  # Asegurando que el user_id sea un ObjectId válido
        self.titulo = titulo
        self.descripcion = descripcion
        self.path = path
        self.path_procesado = path_procesado
        # Si fecha_subida no se proporciona, usar la fecha y hora actual
        self.fecha_subida = fecha_subida if fecha_subida else datetime.now()

    def guardar(self):
        # Usar isoformat() para uniformidad
        video_data = {
            "user_id": self.user_id,
            "titulo": self.titulo,
            "descripcion": self.descripcion,
            "path": self.path,
            "path_procesado": self.path_procesado,
            "fecha_subida": self.fecha_subida.isoformat()  # Guardar como string en formato ISO
        }
        result = db.videos.insert_one(video_data)
        return str(result.inserted_id)  # Devuelve el ID del video insertado como string

    @staticmethod
    def obtener_videos_por_usuario(user_id):
        videos = list(db.videos.find({"user_id": ObjectId(user_id)}))
        return [{
            **{k: (str(v) if isinstance(v, ObjectId) else v) for k, v in video.items()},
            'fecha_subida': video['fecha_subida'] if isinstance(video['fecha_subida'], str) else video[
                'fecha_subida'].isoformat() if 'fecha_subida' in video else None
        } for video in videos]
    @staticmethod
    def buscar_video_por_id(video_id):
        video = db.videos.find_one({"_id": ObjectId(video_id)})
        if video:
            video['_id'] = str(video['_id'])  # Convertir ObjectId a string para facilitar su uso
            return video
        return None

    @staticmethod
    def actualizar_video(video_id, cambios):
        if not cambios:
            raise ValueError("No se proporcionaron cambios para actualizar.")
        result = db.videos.update_one({"_id": ObjectId(video_id)}, {"$set": cambios})
        return result.matched_count > 0

    @staticmethod
    def eliminar_video(video_id):
        result = db.videos.delete_one({"_id": ObjectId(video_id)})
        return result.deleted_count > 0, "Video eliminado con éxito." if result.deleted_count > 0 else "Video no encontrado o error al eliminar."
