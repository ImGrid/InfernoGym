from flask import Blueprint, request, jsonify, send_from_directory
from utils.file_handle import save_file, delete_file
from service.video_service import VideoService
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import base64
import numpy as np
import cv2
from flask import Response
from flask import current_app
from flask import Flask
video_bp = Blueprint('video_bp', __name__, url_prefix='/api/videos')
app = Flask(__name__)
@video_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_video():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    try:
        file_path = save_file(file, file.filename)
        user_id = get_jwt_identity()
        video = VideoService.agregar_video(user_id, request.form.get('titulo'), request.form.get('descripcion'), file_path)
        return jsonify({"message": "Video uploaded successfully", "video_id": video}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@video_bp.route('/user/<user_id>', methods=['GET'])
def get_videos_by_user(user_id):
    videos = VideoService.obtener_videos_por_usuario(user_id)
    return jsonify(videos), 200


@video_bp.route('/<video_id>', methods=['GET'])
def get_video(video_id):
    tipo_video = request.args.get('tipo', 'original')  # 'original' o 'procesado'

    video = VideoService.buscar_video_por_id(video_id)
    if video:
        video_path = video['path_procesado'] if tipo_video == 'procesado' and video.get('path_procesado') else video['path']
        if os.path.exists(video_path):
            def generate():
                with open(video_path, "rb") as video_file:
                    while True:
                        chunk = video_file.read(4096)
                        if not chunk:
                            break
                        yield chunk
            return Response(generate(), mimetype="video/mp4")
        else:
            return jsonify({"error": "File not found"}), 404
    else:
        return jsonify({"error": "Video not found"}), 404


@video_bp.route('/update/<video_id>', methods=['PUT'])
@jwt_required()
def update_video(video_id):
    cambios = request.json
    if VideoService.actualizar_video(video_id, cambios):
        return jsonify({"message": "Video updated successfully"}), 200
    else:
        return jsonify({"error": "Failed to update video"}), 400

@video_bp.route('/delete/<video_id>', methods=['DELETE'])
@jwt_required()
def delete_video(video_id):
    video = VideoService.buscar_video_por_id(video_id)
    if video:
        if delete_file(os.path.basename(video['path'])):
            success, message = VideoService.eliminar_video(video_id)
            if success:
                return jsonify({"message": message}), 200
            else:
                return jsonify({"error": "Failed to delete video record"}), 400
        else:
            return jsonify({"error": "Failed to delete video file"}), 400
    else:
        return jsonify({"error": "Video not found"}), 404

