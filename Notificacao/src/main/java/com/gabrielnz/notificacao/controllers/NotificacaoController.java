package com.gabrielnz.notificacao.controllers;

import com.gabrielnz.notificacao.entities.Notificacao;
import com.gabrielnz.notificacao.entities.StatusNotificacao;
import com.gabrielnz.notificacao.services.NotificacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notificacoes")
public class NotificacaoController {
    @Autowired
    private NotificacaoService notificacaoService;

    @GetMapping("/{id}")
    public ResponseEntity<Notificacao> getPorId(@PathVariable Long id) {
        return ResponseEntity.ok(notificacaoService.getPorId(id));
    }
    @GetMapping
    public ResponseEntity<List<Notificacao>> getAll() {
        return ResponseEntity.ok(notificacaoService.getAll());
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Notificacao>> getByIdUsuario(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(notificacaoService.getByIdUsuario(idUsuario));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Notificacao>> getByStatus(@PathVariable StatusNotificacao status) {
        return ResponseEntity.ok(notificacaoService.getByStatus(status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        notificacaoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
