package com.restaurant.orderservice.infrastructure.controller;

import com.restaurant.orderservice.application.dto.ErrorResponse;
import com.restaurant.orderservice.domain.exception.MenuItemNotAvailableException;
import com.restaurant.orderservice.domain.exception.MenuItemNotFoundException;
import com.restaurant.orderservice.domain.exception.MenuNotFoundException;
import com.restaurant.orderservice.domain.exception.OrderNotFoundException;
import com.restaurant.orderservice.domain.exception.RestaurantNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── 404: entidades no encontradas ─────────────────────────────────────────

    @ExceptionHandler(RestaurantNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleRestaurantNotFound(RestaurantNotFoundException ex) {
        log.warn("Restaurante no encontrado: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("RESTAURANT_NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(MenuNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleMenuNotFound(MenuNotFoundException ex) {
        log.warn("Menú no encontrado: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("MENU_NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(MenuItemNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleMenuItemNotFound(MenuItemNotFoundException ex) {
        log.warn("Producto no encontrado: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("MENU_ITEM_NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleOrderNotFound(OrderNotFoundException ex) {
        log.warn("Pedido no encontrado: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("ORDER_NOT_FOUND", ex.getMessage()));
    }

    // ── 422: reglas de negocio violadas ───────────────────────────────────────

    @ExceptionHandler(MenuItemNotAvailableException.class)
    public ResponseEntity<ErrorResponse> handleMenuItemNotAvailable(MenuItemNotAvailableException ex) {
        log.warn("Producto no disponible: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(new ErrorResponse("VALIDATION_ERROR", ex.getMessage()));
    }

    // ── 400: validación de campos del request ─────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse("Error de validación en el request");

        log.warn("Validación fallida: {}", message);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("VALIDATION_ERROR", message));
    }

    // ── 400: JSON malformado o tipo incorrecto en path variable ───────────────

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadableMessage(HttpMessageNotReadableException ex) {
        log.warn("Request body inválido: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("VALIDATION_ERROR", "El cuerpo del request no es válido o tiene formato incorrecto"));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message = "El parámetro '" + ex.getName() + "' debe ser de tipo " + ex.getRequiredType().getSimpleName();
        log.warn("Tipo incorrecto en parámetro: {}", message);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("VALIDATION_ERROR", message));
    }

    // ── 500: cualquier error no previsto ──────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        log.error("Error interno no controlado: {}", ex.getMessage(), ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("INTERNAL_ERROR", "Ocurrió un error interno. Intente más tarde."));
    }
}
