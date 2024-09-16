from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
from backend.entities.usuario import Usuario
from datetime import datetime

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/login', methods=['POST'])
def login():
    nombre = request.json.get('nombre')
    apellido = request.json.get('apellido')
    password = request.json.get('password')

    user = Usuario.buscar_usuario(nombre, apellido)
    if user and check_password_hash(user['contraseña'], password):
        identity = str(user['_id'])  # Convertir ObjectId a string si no se hizo en el método buscar_usuario
        access_token = create_access_token(identity=identity, expires_delta=timedelta(days=1))
        return jsonify(access_token=access_token, rol=user['rol'], userId=identity), 200

    else:
        return jsonify({"Nombre de usuario o contraseña incorrectos"}), 401

@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200
