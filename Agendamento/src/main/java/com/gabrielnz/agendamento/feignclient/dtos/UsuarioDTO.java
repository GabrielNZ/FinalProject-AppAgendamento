package com.gabrielnz.agendamento.feignclient.dtos;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;

public record UsuarioDTO(Long id, String nome, @Email String email, String senha, @Enumerated(EnumType.STRING)Tipo tipo) {
}
