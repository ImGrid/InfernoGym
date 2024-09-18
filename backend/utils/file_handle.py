import os
from werkzeug.utils import secure_filename
import magic

# Configuración de la carpeta de subidas y extensiones de archivo permitidas
UPLOAD_FOLDER = r'C:\Users\Lenovo\Desktop\OP_PROJECT\backend\api\videos'
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'flv', 'wmv'}


def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
def validate_file_content(file_path):
    """
    Utiliza la biblioteca `python-magic` para validar que el contenido del archivo corresponda a un tipo permitido.
    """
    mime = magic.Magic(mime=True)
    mime_type = mime.from_file(file_path)
    # Asegúrate de que el mime_type corresponda a los tipos de video que deseas permitir
    valid_mime_types = {'video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/x-flv', 'video/x-ms-wmv'}
    return mime_type in valid_mime_types
def save_file(file, filename):
    """
    Guarda un archivo de manera segura en el directorio especificado solo si es válido.
    """
    if file and allowed_file(filename):
        filename = secure_filename(filename)  # Sanitizar el nombre del archivo
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        # Verifica que el contenido del archivo sea un video válido
        if validate_file_content(file_path):
            return file_path
        else:
            os.remove(file_path)  # Eliminar el archivo si no es válido
            raise ValueError("Invalid file content")
    else:
        raise ValueError("File type not allowed or filename not valid")
def delete_file(filename):
    """
    Elimina un archivo del sistema de archivos.
    """
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return True
    return False


