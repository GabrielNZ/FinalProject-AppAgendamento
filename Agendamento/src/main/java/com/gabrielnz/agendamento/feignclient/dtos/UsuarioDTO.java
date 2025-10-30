package com.gabrielnz.agendamento.feignclient.dtos;

public record UsuarioDTO(Long id, String nome, String email, String senha, Tipo tipo) {
}
