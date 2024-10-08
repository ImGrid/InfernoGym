from datetime import datetime
from bson.objectid import ObjectId
from database.db import get_db
db = get_db()

class Reporte:
    def __init__(self, video_id, repeticiones, porcentaje_posicion, comentarios, fecha_creacion=None):
        self.video_id = ObjectId(video_id)  # Asegurando que el video_id sea un ObjectId válido
        self.repeticiones = repeticiones
        self.porcentaje_posicion = porcentaje_posicion
        self.comentarios = comentarios
        self.fecha_creacion = fecha_creacion if fecha_creacion else datetime.now()

    def guardar(self):
        reporte_data = {
            "video_id": self.video_id,
            "repeticiones": self.repeticiones,
            "porcentaje_posicion": self.porcentaje_posicion,
            "comentarios": self.comentarios,
            "fecha_creacion": self.fecha_creacion.isoformat()  # Guardar como string en formato ISO
        }
        result = db.reportes.insert_one(reporte_data)
        return str(result.inserted_id)  # Devuelve el ID del reporte insertado como string

    @staticmethod
    def buscar_reporte_por_video(video_id):
        reporte = db.reportes.find_one({"video_id": ObjectId(video_id)})
        if reporte:
            return {k: (str(v) if isinstance(v, ObjectId) or isinstance(v, datetime) else v) for k, v in reporte.items()}
        return None

    @staticmethod
    def actualizar_reporte_por_video(video_id, cambios):
        if not cambios:
            raise ValueError("No se proporcionaron cambios para actualizar.")
        result = db.reportes.update_one({"video_id": ObjectId(video_id)}, {"$set": cambios})
        return result.matched_count > 0

    @staticmethod
    def eliminar_reporte(reporte_id):
        result = db.reportes.delete_one({"_id": ObjectId(reporte_id)})
        return result.deleted_count > 0, "Reporte eliminado con éxito." if result.deleted_count > 0 else "Reporte no encontrado o error al eliminar."
