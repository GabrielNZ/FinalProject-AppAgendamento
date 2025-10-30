package com.gabrielnz.agendamento.feignclient;

import com.gabrielnz.agendamento.feignclient.dtos.ServicoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Component
@FeignClient(name = "Servicos", path = "/servicos")
public interface ServicoFeingClient {
    @GetMapping("/{id}")
    ResponseEntity<ServicoDTO> getPorId(@PathVariable Long id);
}
