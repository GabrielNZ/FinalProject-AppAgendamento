package com.gabrielnz.agendamento.feignclient;

import com.gabrielnz.agendamento.entities.dtos.UsuarioDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Component
@FeignClient(name = "Usuario", path = "/usuarios")
public interface UsuarioFeingClient {
    @GetMapping("/{id}")
    ResponseEntity<UsuarioDTO> getPorId(@PathVariable Long id);
    @PutMapping
    ResponseEntity<UsuarioDTO> atualizarUsuario(@RequestBody UsuarioDTO usuarioDTO);
}
