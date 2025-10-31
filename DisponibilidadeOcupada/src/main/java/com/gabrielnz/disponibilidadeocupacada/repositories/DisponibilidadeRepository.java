package com.gabrielnz.disponibilidadeocupacada.repositories;

import com.gabrielnz.disponibilidadeocupacada.entities.DisponibilidadeOcupada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DisponibilidadeRepository extends JpaRepository<DisponibilidadeOcupada,Long> {
    List<DisponibilidadeOcupada> findAllByPrestadorId(Long prestadorId);

    List<DisponibilidadeOcupada> findAllByPrestadorIdAndDataHoraInicioBetween(Long prestadorId, LocalDateTime inicioDoDia, LocalDateTime fimDoDia);


}
