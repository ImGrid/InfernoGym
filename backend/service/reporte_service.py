from backend.entities.reporte import Reporte

class ReporteService:
    @staticmethod
    def crear_reporte(video_id, repeticiones, porcentaje_posicion, comentarios):
        """Crea y almacena un nuevo reporte."""
        nuevo_reporte = Reporte(video_id, repeticiones, porcentaje_posicion, comentarios)
        return nuevo_reporte.guardar()

    @staticmethod
    def obtener_reporte_por_video(video_id):
        """Recupera el reporte asociado a un video específico."""
        return Reporte.buscar_reporte_por_video(video_id)

    def actualizar_reporte_por_video(video_id, cambios):
        """Actualiza la información de un reporte existente basado en video_id."""
        return Reporte.actualizar_reporte_por_video(video_id, cambios)

    @staticmethod
    def eliminar_reporte(reporte_id):
        """Elimina un reporte específico."""
        exito, mensaje = Reporte.eliminar_reporte(reporte_id)
        return {"exito": exito, "mensaje": mensaje}
