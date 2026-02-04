package com.gabrielnz.servicos.repositories;

import com.gabrielnz.servicos.entities.Servicos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServicosRepository extends JpaRepository<Servicos, Long> {
    List<Servicos> findAllByPrestadorId(Long prestadorId);
}
