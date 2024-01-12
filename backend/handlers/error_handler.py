from flask import jsonify
from werkzeug.exceptions import HTTPException
import traceback

def configure_error_handlers(app):

    @app.errorhandler(Exception)
    def handle_exception(e):
    # If the error is a HTTPException, return its error code and message
        if isinstance(e, HTTPException):
            response = e.get_response()
            response.data = jsonify({
                "code": e.code,
                "name": e.name,
                "description": e.description,
            }).data
            response.content_type = "application/json"
            return response

        # If the error is not a HTTPException, then it's an internal error
        # Log the error
        app.logger.error(traceback.format_exc())

        # Return internal server error code along with the traceback
        return jsonify({
            "code": 500,
            "name": "Internal Server Error",
            "description": "An internal error has occurred.",
            "traceback": traceback.format_exc().splitlines()
        }), 500
