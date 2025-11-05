package com.gabrielnz.notificacao.repositories;

import com.gabrielnz.notificacao.entities.Notificacao;
import com.gabrielnz.notificacao.entities.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {
    List<Notificacao> findAllByUsuarioId(Long id);

    List<Notificacao> findByStatusIn(List<Status> statusList);

    List<Notificacao> findByStatusInAndTentativasLessThan(List<Status> pendente, Integer i);
}
