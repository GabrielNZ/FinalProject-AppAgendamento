package com.gabrielnz.agendamento.feignclient;

import com.gabrielnz.agendamento.feignclient.dtos.UsuarioDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Component
@FeignClient(name = "Usuario", path = "/usuarios")
public interface UsuarioFeingClient {
    @GetMapping("/{id}")
    ResponseEntity<UsuarioDTO> getPorId(@PathVariable Long id);
}
