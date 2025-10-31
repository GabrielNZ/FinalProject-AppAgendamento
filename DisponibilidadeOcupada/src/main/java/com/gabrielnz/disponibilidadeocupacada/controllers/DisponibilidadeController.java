package com.gabrielnz.disponibilidadeocupacada.controllers;

import com.gabrielnz.disponibilidadeocupacada.entities.dtos.AgendamentoDataDTO;
import com.gabrielnz.disponibilidadeocupacada.entities.DisponibilidadeOcupada;
import com.gabrielnz.disponibilidadeocupacada.services.DisponibilidadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/disponibilidades")
public class DisponibilidadeController {
    @Autowired
    private DisponibilidadeService disponibilidadeService;

    @GetMapping("/{id}")
    public ResponseEntity<List<DisponibilidadeOcupada>> getPorPrestadorId(@PathVariable Long id){
        return ResponseEntity.ok().body(disponibilidadeService.getDisponibilidadesPorId(id));
    }
    @GetMapping
    public ResponseEntity<Boolean> estaDisponivel(@RequestBody AgendamentoDataDTO agendamentoData){
        return ResponseEntity.ok().body(disponibilidadeService.estaDisponivel(agendamentoData));
    }
    @PostMapping
    public ResponseEntity<DisponibilidadeOcupada> salvarDisponibilidade(@RequestBody AgendamentoDataDTO agendamentoData){
        return ResponseEntity.ok().body(disponibilidadeService.salvarDisponibilidade(agendamentoData));
    }
    @PutMapping("/{id}")
    public ResponseEntity<DisponibilidadeOcupada> atualizarDisponibilidade(@PathVariable Long id, @RequestBody AgendamentoDataDTO agendamentoData){
        return ResponseEntity.ok().body(disponibilidadeService.updateDisponibilidade(id,agendamentoData));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarDisponibilidade(@PathVariable Long id) {
        disponibilidadeService.deletarDisponibilidade(id);
        return ResponseEntity.noContent().build();
    }
}
