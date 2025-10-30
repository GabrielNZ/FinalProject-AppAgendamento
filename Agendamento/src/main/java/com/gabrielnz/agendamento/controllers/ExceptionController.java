package com.gabrielnz.agendamento.controllers;

import com.gabrielnz.agendamento.entities.exceptions.AgendamentoException;
import com.gabrielnz.agendamento.entities.exceptions.ServicosException;
import com.gabrielnz.agendamento.entities.exceptions.UsuarioException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class ExceptionController {
    @ExceptionHandler(AgendamentoException.class)
    public ResponseEntity<String> handleAgendamentoException(AgendamentoException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
    @ExceptionHandler(ServicosException.class)
    public ResponseEntity<String> handleUsuarioException(ServicosException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
    @ExceptionHandler(UsuarioException.class)
    public ResponseEntity<String> handleUsuarioException(UsuarioException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
}
