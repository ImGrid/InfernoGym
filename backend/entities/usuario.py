from backend.database.db import get_db
from datetime import datetime, timedelta
from bson.objectid import ObjectId
db = get_db()
class Usuario:
    CAMPOS_VALIDOS = {
        'nombre', 'apellido', 'contraseña', 'rol', 'fecha_registro',
        'fecha_caducidad', 'tipo', 'pago', 'estado'
    }
    def __init__(self, nombre, apellido, contraseña, rol, fecha_registro, fecha_caducidad, tipo, pago, estado=True):
        if fecha_caducidad < fecha_registro:
            raise ValueError("La fecha de caducidad no puede ser anterior a la fecha de registro.")

        self.nombre = nombre
        self.apellido = apellido
        self.contraseña = contraseña
        self.rol = rol
        self.fecha_registro = fecha_registro
        self.fecha_caducidad = fecha_caducidad
        self.tipo = tipo
        self.pago = pago
        self.estado = estado

    def guardar(self):
        datos_usuario = {
            "nombre": self.nombre,
            "apellido": self.apellido,
            "contraseña": self.contraseña,
            "rol": self.rol,
            "fecha_registro": self.fecha_registro.isoformat(),  # isoformat() aún funciona con date
            "fecha_caducidad": self.fecha_caducidad.isoformat(),
            "tipo": self.tipo,
            "pago": self.pago,
            "estado": self.estado
        }
        return db.usuarios.insert_one(datos_usuario)
    @staticmethod
    def leer_usuarios():
        usuarios = list(db.usuarios.find({}))
        return [{k: (str(v) if isinstance(v, ObjectId) else v) for k, v in usuario.items()} for usuario in usuarios]

    @staticmethod
    def buscar_usuario_por_id(user_id):
        try:
            usuario = db.usuarios.find_one({"_id": ObjectId(user_id)})
            if usuario:
                # Convertir ObjectId a string
                usuario['_id'] = str(usuario['_id'])
                return usuario
            else:
                return None
        except Exception as e:
            print("Error al buscar el usuario:", e)
            return None
    @staticmethod
    def actualizar_usuario(user_id, cambios):
        """Actualiza la información de un usuario basado en su ID."""
        if not cambios:
            raise ValueError("No se proporcionaron cambios para actualizar.")

        # Obtener el usuario por ID para verificar su existencia antes de intentar actualizarlo
        if not Usuario.buscar_usuario_por_id(user_id):
            raise ValueError("El usuario no existe.")

        # Filtrar cambios solo para campos válidos
        cambios_filtrados = {k: v for k, v in cambios.items() if k in Usuario.CAMPOS_VALIDOS}
        if not cambios_filtrados:
            raise ValueError("No se proporcionaron campos válidos para actualizar.")

        # Actualizar el usuario en la base de datos
        resultado = db.usuarios.update_one({"_id": ObjectId(user_id)}, {"$set": cambios_filtrados})
        return resultado.matched_count > 0

    @staticmethod
    def buscar_usuario(nombre, apellido):
        usuario = db.usuarios.find_one({"nombre": nombre, "apellido": apellido})
        if usuario:
            usuario['_id'] = str(usuario['_id'])  # Asegurarse de que el ID es una cadena
        return usuario

    def eliminar_por_id(user_id):
        """ Elimina un usuario usando su ID. """
        resultado = db.usuarios.delete_one({"_id": ObjectId(user_id)})
        if resultado.deleted_count > 0:
            return True, "Usuario eliminado con éxito."
        else:
            return False, "Usuario no encontrado o error al eliminar."
