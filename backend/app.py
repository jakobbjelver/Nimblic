from flask import Flask
from flask_cors import CORS
from config.celery_config import make_celery
from utils.celery_utils import create_celery_tasks
from routes.routes import configure_routes
from handlers.error_handler import configure_error_handlers
import logging

app = Flask(__name__)
CORS(app)

app.config.update( 
    CELERY_BROKER_URL='redis://redis:6379/0',
    CELERY_RESULT_BACKEND='redis://redis:6379/0'
)

celery = make_celery(app)
test_celery, async_detect_change_points, async_object_analysis, async_distribution_by_numerical, async_privacy_assessment = create_celery_tasks(celery)
celery.tasks.register(test_celery)
celery.tasks.register(async_detect_change_points)
celery.tasks.register(async_object_analysis)
celery.tasks.register(async_privacy_assessment)
celery.tasks.register(async_distribution_by_numerical)

@app.route('/', methods=['GET'])
def home():
    return "Welcome to the Flask App!"


configure_routes(app, celery)
configure_error_handlers(app)

logging.basicConfig(level=logging.INFO)
app.logger.setLevel(logging.INFO)

if __name__ == '__main__':
    app.run(debug=True)
