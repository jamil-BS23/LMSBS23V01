from fastapi import HTTPException, status
from typing import Dict, Any


def validation_error(detail: Dict[str, Any] = None):
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Validation failed",
                "details": detail or {}
            }
        }
    )


def unauthorized_error(message: str = "Invalid credentials"):
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "error": {
                "code": "INVALID_CREDENTIALS",
                "message": message,
                "details": {}
            }
        },
        headers={"WWW-Authenticate": "Bearer"}
    )


def forbidden_error(message: str = "Forbidden"):
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={
            "error": {
                "code": "FORBIDDEN",
                "message": message,
                "details": {}
            }
        }
    )


def not_found_error(entity: str = "Resource", entity_id: Any = None):
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={
            "error": {
                "code": "NOT_FOUND",
                "message": f"{entity} not found",
                "details": {f"{entity.lower()}_id": entity_id} if entity_id else {}
            }
        }
    )


def conflict_error(message: str = "Conflict", details: Dict[str, Any] = None):
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail={
            "error": {
                "code": "CONFLICT",
                "message": message,
                "details": details or {}
            }
        }
    )


def internal_error(message: str = "Internal server error"):
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": message,
                "details": {}
            }
        }
    )
