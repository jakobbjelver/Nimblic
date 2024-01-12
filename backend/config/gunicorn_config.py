# Gunicorn server configuration

bind = '0.0.0.0:8000'
workers = 2
timeout = 600
keepalive = 600
worker_class = 'sync'


