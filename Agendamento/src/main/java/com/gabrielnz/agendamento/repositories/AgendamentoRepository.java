package com.gabrielnz.agendamento.repositories;

import com.gabrielnz.agendamento.entities.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
    List<Agendamento> findAllByClienteId(Long clienteId);
    List<Agendamento> findAllByPrestadorId(Long prestadorId);
}
