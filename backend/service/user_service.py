from entities.usuario import Usuario
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
class UserService:
    def __init__(self):
        pass

    def crear_usuario(self, nombre, apellido, contraseña, rol, fecha_registro, fecha_caducidad, tipo, pago):
        fecha_registro_date = datetime.strptime(fecha_registro, '%Y-%m-%d').date()
        fecha_caducidad_date = datetime.strptime(fecha_caducidad, '%Y-%m-%d').date()

        if fecha_caducidad_date < fecha_registro_date:
            raise ValueError("La fecha de caducidad no puede ser anterior a la fecha de registro.")

        contraseña_hash = generate_password_hash(contraseña)
        usuario = Usuario(nombre, apellido, contraseña_hash, rol, fecha_registro_date, fecha_caducidad_date, tipo, pago)
        return usuario.guardar()

    def obtener_usuarios(self):
        """ Obtiene todos los usuarios registrados. """
        return Usuario.leer_usuarios()

    def buscar_usuario_por_id(self, user_id):
        """ Busca un usuario por su ID. """
        return Usuario.buscar_usuario_por_id(user_id)

    def actualizar_usuario(self, user_id, cambios):
        """ Actualiza la información de un usuario existente. """
        cambios_con_hash = {}
        if 'contraseña' in cambios:
            cambios_con_hash['contraseña'] = generate_password_hash(cambios['contraseña'])
        cambios_con_hash.update({k: v for k, v in cambios.items() if k != 'contraseña'})
        return Usuario.actualizar_usuario(user_id, cambios_con_hash)
    def eliminar_usuario(self, user_id):
        """ Elimina un usuario de la base de datos por ID. """
        return Usuario.eliminar_por_id(user_id)

# Ejemplo de uso del servicio en algún punto de la aplicación
# userService = UserService(mongo.db)
# user_id = userService.crear_usuario('Juan', 'Perez', 'mipassword', 'usuario', '2022-05-01', '2023-05-01', 'gimnasio', 100)
# print(user_id)
