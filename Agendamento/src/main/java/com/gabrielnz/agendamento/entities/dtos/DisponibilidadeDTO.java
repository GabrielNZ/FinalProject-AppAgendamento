package com.gabrielnz.agendamento.entities.dtos;

import java.time.LocalDateTime;

public record DisponibilidadeDTO(Long id, LocalDateTime dataHoraInicio, LocalDateTime dataHoraFim, Long prestadorId) {
}
