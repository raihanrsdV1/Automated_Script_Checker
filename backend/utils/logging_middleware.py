import logging
import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

# Configure basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log Request
        log_message = f"Request: {request.method} {request.url.path}"
        if request.query_params:
            log_message += f"?{request.query_params}"
        logger.info(log_message)
        
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            # Log Response
            logger.info(f"Response: {request.method} {request.url.path} - Status: {response.status_code} - Took: {process_time:.4f}s")
            return response
        except Exception as e:
            process_time = time.time() - start_time
            logger.error(f"Error during request {request.method} {request.url.path}: {e} - Took: {process_time:.4f}s", exc_info=True)
            # Reraise the exception to be handled by FastAPI's exception handlers
            raise e
