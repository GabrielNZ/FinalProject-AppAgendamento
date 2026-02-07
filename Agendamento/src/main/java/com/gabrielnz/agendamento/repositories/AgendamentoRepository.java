package com.gabrielnz.agendamento.repositories;

import com.gabrielnz.agendamento.entities.Agendamento;
import com.gabrielnz.agendamento.entities.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
    List<Agendamento> findAllByClienteId(Long clienteId);
    List<Agendamento> findAllByPrestadorId(Long prestadorId);
    // No Repository
    @Query("SELECT a FROM Agendamento a WHERE a.status = :status AND a.dataHora < :agora")
    List<Agendamento> findAgendamentosParaConcluir(Status status, LocalDateTime agora);
}
