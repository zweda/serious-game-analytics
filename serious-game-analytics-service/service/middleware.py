import traceback

from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin


class ErrorMiddleware(MiddlewareMixin):
    def process_exception(self, request, exception):
        response_data = {
            'error': str(exception),
            'type': type(exception).__name__,
            'stacktrace': traceback.format_exc()
        }
        return JsonResponse(response_data, status=500)
