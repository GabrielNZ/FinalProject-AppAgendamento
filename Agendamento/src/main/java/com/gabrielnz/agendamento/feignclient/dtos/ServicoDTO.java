package com.gabrielnz.agendamento.feignclient.dtos;

public record ServicoDTO(Long id, String nome, String descricao, Integer duracaoMinutos, Double preco, Long prestador_id) {
}
