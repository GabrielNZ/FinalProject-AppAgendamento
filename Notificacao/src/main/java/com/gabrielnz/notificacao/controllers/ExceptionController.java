package com.gabrielnz.notificacao.controllers;

import com.gabrielnz.notificacao.entities.exceptions.NotificacaoException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class ExceptionController {
    @ExceptionHandler(NotificacaoException.class)
    public ResponseEntity<String> handleAgendamentoException(NotificacaoException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
}
