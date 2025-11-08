package com.gabrielnz.agendamento.feignclient;

import com.gabrielnz.agendamento.entities.dtos.AgendamentoDataDTO;
import com.gabrielnz.agendamento.entities.dtos.DisponibilidadeDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

@Component
@FeignClient(name = "DisponibilidadeOcupada", path = "/disponibilidades")
public interface DisponibilidadeOcupadaFeingClient {
    @PostMapping("/disponivel")
    ResponseEntity<Boolean> estaDisponivel(@RequestBody AgendamentoDataDTO agendamentoData);

    @PostMapping
    ResponseEntity<DisponibilidadeDTO> salvarDisponibilidade(@RequestBody AgendamentoDataDTO agendamentoData);

    @PutMapping("/{id}")
    ResponseEntity<DisponibilidadeDTO> atualizarDisponibilidade(@PathVariable Long id, @RequestBody AgendamentoDataDTO agendamentoData);

    @DeleteMapping("/{id}")
    ResponseEntity<Void> deletarDisponibilidade(@PathVariable Long id);
}
