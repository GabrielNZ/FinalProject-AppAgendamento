package com.gabrielnz.usuario.controllers;

import com.gabrielnz.usuario.entities.exceptions.UsuarioException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class ExceptionController {
    @ExceptionHandler(UsuarioException.class)
    public ResponseEntity<String> handleUsuarioException(UsuarioException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
}
