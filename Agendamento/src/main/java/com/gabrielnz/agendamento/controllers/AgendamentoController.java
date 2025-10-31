package com.gabrielnz.agendamento.controllers;

import com.gabrielnz.agendamento.entities.Agendamento;
import com.gabrielnz.agendamento.feignclient.UsuarioFeingClient;
import com.gabrielnz.agendamento.services.AgendamentoServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/agendamentos")
public class AgendamentoController {
    @Autowired
    private AgendamentoServices agendamentoServices;

    @Autowired
    UsuarioFeingClient usuarioFeingCliente;

    @GetMapping("/{id}")
    public ResponseEntity<Agendamento> getPorId(@PathVariable Long id){
        return ResponseEntity.ok().body(agendamentoServices.getAgendamentoPorId(id));
    }
    @GetMapping
    public ResponseEntity<List<Agendamento>> getTodosAgendamentos(){
        return ResponseEntity.ok().body(agendamentoServices.getTodosAgendamentos());
    }
    @PostMapping
    public ResponseEntity<Agendamento> criarAgendamento(@RequestBody Agendamento agendamento){
        return ResponseEntity.ok().body(agendamentoServices.salvarAgendamento(agendamento));
    }
    @PutMapping
    public ResponseEntity<Agendamento> atualizarAgendamento(@RequestBody Agendamento agendamento){
        return ResponseEntity.ok().body(agendamentoServices.salvarAgendamento(agendamento));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarAgendamento(@PathVariable Long id) {
        agendamentoServices.deletarAgendamento(id);
        return ResponseEntity.noContent().build();
    }
}
