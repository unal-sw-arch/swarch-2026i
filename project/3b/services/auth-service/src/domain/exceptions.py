from typing import Optional

class AuthBaseException(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class UserNotFoundException(AuthBaseException):
    def __init__(self, message: str = "User not found"):
        super().__init__(code="USER_NOT_FOUND", message=message, status_code=404)

class UnauthorizedException(AuthBaseException):
    def __init__(self, message: str = "Invalid credentials"):
        super().__init__(code="UNAUTHORIZED", message=message, status_code=401)

class ForbiddenException(AuthBaseException):
    def __init__(self, message: str = "Access denied"):
        super().__init__(code="FORBIDDEN", message=message, status_code=403)

class ValidationException(AuthBaseException):
    def __init__(self, message: str):
        super().__init__(code="VALIDATION_ERROR", message=message, status_code=422)

class InternalErrorException(AuthBaseException):
    def __init__(self, message: str = "Internal server error"):
        super().__init__(code="INTERNAL_ERROR", message=message, status_code=500)
