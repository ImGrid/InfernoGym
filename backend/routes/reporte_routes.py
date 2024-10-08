from flask import Blueprint, request, jsonify
from service.reporte_service import ReporteService
from flask_jwt_extended import jwt_required

reporte_bp = Blueprint('reporte_bp', __name__, url_prefix='/api/reportes')

@reporte_bp.route('/crear', methods=['POST'])
@jwt_required()
def crear_reporte():
    datos = request.get_json()
    video_id = datos.get('video_id')
    repeticiones = datos.get('repeticiones')
    porcentaje_posicion = datos.get('porcentaje_posicion')
    comentarios = datos.get('comentarios')
    try:
        reporte_id = ReporteService.crear_reporte(video_id, repeticiones, porcentaje_posicion, comentarios)
        return jsonify({"mensaje": "Reporte creado exitosamente", "reporte_id": reporte_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@reporte_bp.route('/<video_id>', methods=['GET'])
def obtener_reporte_por_video(video_id):
    try:
        reporte = ReporteService.obtener_reporte_por_video(video_id)
        if reporte:
            return jsonify(reporte), 200
        else:
            return jsonify({"error": "Reporte no encontrado"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@reporte_bp.route('/actualizar/<video_id>', methods=['PUT'])
@jwt_required()
def actualizar_reporte(video_id):
    cambios = request.get_json()
    try:
        if ReporteService.actualizar_reporte_por_video(video_id, cambios):
            return jsonify({"mensaje": "Reporte actualizado exitosamente"}), 200
        else:
            return jsonify({"error": "Actualización fallida"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@reporte_bp.route('/eliminar/<reporte_id>', methods=['DELETE'])
@jwt_required()
def eliminar_reporte(reporte_id):
    try:
        exito, mensaje = ReporteService.eliminar_reporte(reporte_id)
        if exito:
            return jsonify({"mensaje": mensaje}), 200
        else:
            return jsonify({"error": "Error al eliminar reporte"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400
