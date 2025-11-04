package com.gabrielnz.agendamento.feignclient.dtos;

import java.time.LocalDateTime;

public record DisponibilidadeDTO(Long id, LocalDateTime dataHoraInicio, LocalDateTime dataHoraFim, Long prestadorId) {
}
