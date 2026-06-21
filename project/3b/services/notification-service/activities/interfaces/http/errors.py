from rest_framework.response import Response


def error_response(code, message, status_code):
    return Response(
        {
            "code": code,
            "message": message,
        },
        status=status_code,
    )