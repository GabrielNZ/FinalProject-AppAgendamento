package com.gabrielnz.servicos.controllers;

import com.gabrielnz.servicos.entities.exceptions.ServicosException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class ExceptionController {
    @ExceptionHandler(ServicosException.class)
    public ResponseEntity<String> handleUsuarioException(ServicosException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
}
