from flask import Blueprint, request, jsonify
from backend.service.user_service import UserService
from flask_jwt_extended import jwt_required
user_bp = Blueprint('user_bp', __name__, url_prefix='/api/user')
@user_bp.route('/create', methods=['POST'])
@jwt_required()
def create_user():
    try:
        data = request.get_json()
        nombre = data.get('nombre')
        apellido = data.get('apellido')
        contraseña = data.get('contraseña')
        rol = data.get('rol')
        fecha_registro = data.get('fecha_registro')
        fecha_caducidad = data.get('fecha_caducidad')
        tipo = data.get('tipo')
        pago = data.get('pago')

        if not all([nombre, apellido, contraseña, rol, fecha_registro, fecha_caducidad, tipo, pago]):
            raise ValueError("Falta uno o más campos necesarios para crear el usuario.")

        usuario = UserService().crear_usuario(nombre, apellido, contraseña, rol, fecha_registro, fecha_caducidad, tipo, pago)
        return jsonify({"message": "Usuario creado exitosamente", "usuario_id": str(usuario)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@user_bp.route('/<user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    try:
        usuario_service = UserService()
        user = usuario_service.buscar_usuario_por_id(user_id)
        if user:
            return jsonify(user), 200
        else:
            return jsonify({"error": "Usuario no encontrado"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@user_bp.route('/update/<user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    try:
        data = request.get_json()
        usuario_service = UserService()
        updated_user = usuario_service.actualizar_usuario(user_id, data)
        if updated_user:
            return jsonify({"message": "Usuario actualizado con éxito"}), 200
        else:
            return jsonify({"error": "Actualización fallida"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@user_bp.route('/delete/<user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    try:
        usuario_service = UserService()
        result = usuario_service.eliminar_usuario(user_id)
        if result:
            return jsonify({"message": "Usuario eliminado con éxito"}), 200
        else:
            return jsonify({"error": "Usuario no encontrado o error al eliminar"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@user_bp.route('/list', methods=['GET'])
@jwt_required()
def list_users():
    try:
        usuario_service = UserService()
        users = usuario_service.obtener_usuarios()
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400