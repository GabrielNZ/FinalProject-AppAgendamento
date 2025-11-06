package com.gabrielnz.agendamento.entities.dtos;

import jakarta.validation.constraints.NotNull;

public record ServicoDTO(Long id, String nome, String descricao, @NotNull Integer duracaoMinutos, Double preco, Long prestador_id) {
}
