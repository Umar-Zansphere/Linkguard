from fastapi import Request
from fastapi.responses import JSONResponse

class ServiceError(Exception):
    pass

async def service_error_exception_handler(request: Request, exc: ServiceError):
    return JSONResponse(
        status_code=503,
        content={"message": f"An external service error occurred: {exc}"},
    )