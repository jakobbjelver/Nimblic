from flask import Flask
from flask_cors import CORS
from config.celery_config import celery_app
from utils.celery_utils import create_celery_tasks
from routes.routes import configure_routes
from handlers.error_handler import configure_error_handlers
import logging
from handlers.security_handler import firebase_auth_middleware
import os

app = Flask(__name__)

# Conditional CORS configuration
if os.environ.get('FLASK_ENV') == 'development':
    # Allow all origins in development
    CORS(app)
else:
    # Restrict origins in production
    cors = CORS(app, resources={
        r"/*": {
            "origins": [
                "https://www.nimblic.app",
                "https://nimblic.app",
                "https://nimblic.web.app",
                "https://www.nimblic.web.app"
            ]
        }
    })

# Initialize the Firebase Auth Middleware
firebase_auth_middleware(app)

# Flask app configuration
app.config.update(
    broker_url='redis://redis-service:6379/0',
    result_backend='redis://redis-service:6379/0',
    task_time_limit=600,
    task_soft_time_limit=600,
    worker_concurrency=6
)

# Update Celery configuration with Flask app settings
celery_app.conf.update(app.config)

# Create and register Celery tasks
test_celery, async_detect_change_points, async_object_analysis, async_distribution_by_numerical, async_privacy_assessment = create_celery_tasks(celery_app)
celery_app.tasks.register(test_celery)
celery_app.tasks.register(async_detect_change_points)
celery_app.tasks.register(async_object_analysis)
celery_app.tasks.register(async_privacy_assessment)
celery_app.tasks.register(async_distribution_by_numerical)

@app.route('/', methods=['GET'])
def home():
    return "Welcome to the Nimblic Backend!"


configure_routes(app, celery_app)
configure_error_handlers(app)

logging.basicConfig(level=logging.DEBUG)
app.logger.setLevel(logging.DEBUG)

if __name__ == '__main__':
    app.run(debug=True)
