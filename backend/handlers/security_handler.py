from flask import Flask, request, jsonify, g
from firebase_admin import credentials, initialize_app, auth
from google.cloud import firestore
import time
import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

"""
# Initialize Firebase Admin and Firestore Client
service_account_key_path = '/app/nimblic_service_key.json'
if service_account_key_path:
    logging.info(f"Crediential path: {service_account_key_path}")
    cred = credentials.Certificate(service_account_key_path)
    logging.info(f"Crediential object: {cred}")
    logging.info(f"Initializing with predefined credentials")

    #initialize_app(cred)
else:
    logging.info(f"Initializing with default credentials")
    initialize_app()
"""

logging.info(f"Initializing with default credentials")
initialize_app()


db = firestore.Client()

default_file_size_limit = 10  # limit in MB

# Utility functions
def get_user_ip():
    return request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR', ''))

def verify_firebase_token(token):
    try:
        logging.info(f"Token: {token}")
        decoded_token = auth.verify_id_token(token)
        email_verified = decoded_token.get('email_verified', False)

        # Check if email is verified or the user signed up with a Google account
        if not email_verified and decoded_token.get('firebase', {}).get('sign_in_provider') != 'google.com':
            logging.error("Email not verified")
            return None

        return decoded_token
    except auth.InvalidIdTokenError:
        logging.error("Invalid ID token")
        return None
    except auth.ExpiredIdTokenError:
        logging.error("Expired ID token")
        return None
    except Exception as e:
        logging.error(f"Unknown error verifying token: {e}")
        return None


def firebase_auth_middleware(app): 
    # Middleware for Firebase authentication
    @app.before_request
    def before_request_func():
        user_ip = get_user_ip()
    
        # Bypass token check for OPTIONS requests
        if request.method == 'OPTIONS':
            logging.info(f"Preflight access from: {user_ip}")
            return
        

        if request.path == '/upload':
            
            logging.info(f"Access attempt for /upload from IP: {user_ip}")
            logging.info(f"Method: {request.method}")
            logging.info(f"Request headers: {request.headers}")

            token = request.headers.get('Authorization')
            user = verify_firebase_token(token)

            if not user:
                return jsonify({"message": f"Unauthorized - user token invalid, token: {token}"}), 401

            g.user = user
            process_upload_request(user['uid'], app)

    @app.after_request
    def set_security_headers(response):
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        return response


# Upload request processing
def process_upload_request(user_id, app):

    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        logging.error("User data not found")
        return jsonify({"message": "User data not found - no user found in database"}), 404

    user_data = user_doc.to_dict()

    logging.info(f"User from database: {str(user_data)}")

    # Set fileSizeLimit globally in the Flask app
    app.config['FILE_SIZE_LIMIT'] = user_data.get('fileSizeLimit', default_file_size_limit)

    check_upload_limit_and_update(user_data, user_ref)

def check_upload_limit_and_update(user_data, user_ref):
    today = datetime.datetime.now().date()
    last_uploads = user_data.get('lastUploads', [])
    upload_limit = user_data.get('uploadLimit', 10)

    # Filter uploads for today and count them
    today_uploads = [upload for upload in last_uploads if upload.date() == today]
    if len(today_uploads) >= upload_limit:
        return jsonify({"message": f"Upload limit exceeded - current: {today_uploads}, limit: {upload_limit}"}), 429

    # Update last uploads, keeping the last 50 uploads only
    last_uploads.append(datetime.datetime.now())
    user_ref.update({'lastUploads': last_uploads[-50:]})
