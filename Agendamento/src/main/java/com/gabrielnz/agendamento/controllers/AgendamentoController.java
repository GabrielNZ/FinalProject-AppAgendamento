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
        return ResponseEntity.ok().body(agendamentoServices.updateAgendamento(agendamento));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarAgendamento(@PathVariable Long id) {
        agendamentoServices.deletarCancelarAgendamento(id);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/aprovar/{id}")
    public ResponseEntity<Agendamento> aprovarAgendamento(@RequestParam Long id){
        return ResponseEntity.ok().body(agendamentoServices.aprovarAgendamento(id));
    }
    @PutMapping("/recusar/{id}")
    public ResponseEntity<Agendamento> recusarAgendamento(@RequestParam Long id){
        return ResponseEntity.ok().body(agendamentoServices.recusarCancelarAgendamento(id));
    }
    @PutMapping("/cancelar/{id}")
    public ResponseEntity<Agendamento> cancelarAgendamento(@RequestParam Long id){
        return ResponseEntity.ok().body(agendamentoServices.recusarCancelarAgendamento(id));
    }
    @PutMapping("/faltou/{id}")
    public ResponseEntity<Agendamento> confirmarFalta(@PathVariable Long id){
        return ResponseEntity.ok().body(agendamentoServices.confirmarFalta(id));
    }
}
