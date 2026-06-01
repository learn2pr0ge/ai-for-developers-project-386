"""Ошибки API в формате контракта `ErrorResponse` ({code, message}).

Все бизнес-ошибки бросаются как `ApiError` и централизованно
сериализуются обработчиком, зарегистрированным в `create_app()`.
"""

from __future__ import annotations

from flask import Flask, jsonify


class ApiError(Exception):
    """Ошибка с HTTP-статусом и телом ErrorResponse."""

    def __init__(self, status: int, code: str, message: str) -> None:
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message


def not_found(message: str, code: str = "not_found") -> ApiError:
    return ApiError(404, code, message)


def conflict(message: str, code: str = "conflict") -> ApiError:
    return ApiError(409, code, message)


def unprocessable(message: str, code: str = "validation_error") -> ApiError:
    return ApiError(422, code, message)


def register_error_handlers(app: Flask) -> None:
    """Регистрирует обработчики, возвращающие JSON ErrorResponse."""

    @app.errorhandler(ApiError)
    def _handle_api_error(err: ApiError):
        response = jsonify({"code": err.code, "message": err.message})
        response.status_code = err.status
        return response

    @app.errorhandler(404)
    def _handle_404(_err):
        response = jsonify({"code": "not_found", "message": "Ресурс не найден"})
        response.status_code = 404
        return response

    @app.errorhandler(405)
    def _handle_405(_err):
        response = jsonify(
            {"code": "method_not_allowed", "message": "Метод не разрешён"}
        )
        response.status_code = 405
        return response
