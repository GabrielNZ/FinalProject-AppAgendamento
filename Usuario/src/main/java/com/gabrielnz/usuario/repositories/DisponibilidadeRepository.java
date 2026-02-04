package com.gabrielnz.usuario.repositories;

import com.gabrielnz.usuario.entities.Disponibilidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisponibilidadeRepository extends JpaRepository<Disponibilidade, Long> {
    List<Disponibilidade> findByPrestadorId(Long prestadorId);
}
