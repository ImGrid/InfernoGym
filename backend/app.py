from flask_jwt_extended import JWTManager
from flask_cors import CORS
from datetime import timedelta
from flask import Flask
from auth.auth_route import auth_bp
from routes.user_routes import user_bp
from routes.video_routes import video_bp
from routes.reporte_routes import reporte_bp

from db import get_db

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
db = get_db()

# Configuración del JWT
app.config['JWT_SECRET_KEY'] = 'secreto'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
jwt = JWTManager(app)

# Registro de los Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(video_bp, url_prefix='/api/videos')
app.register_blueprint(reporte_bp, url_prefix='/api/reportes')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
