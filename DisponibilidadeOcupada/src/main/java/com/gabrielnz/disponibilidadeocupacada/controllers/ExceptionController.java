package com.gabrielnz.disponibilidadeocupacada.controllers;

import com.gabrielnz.disponibilidadeocupacada.entities.exceptions.DisponibilidadeException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class ExceptionController {
    @ExceptionHandler(DisponibilidadeException.class)
    public ResponseEntity<String> handleDisponibilidadeException(DisponibilidadeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
}
