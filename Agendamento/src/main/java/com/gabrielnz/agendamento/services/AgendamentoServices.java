package com.gabrielnz.agendamento.services;

import com.gabrielnz.agendamento.entities.Agendamento;
import com.gabrielnz.agendamento.entities.Status;
import com.gabrielnz.agendamento.entities.StatusNotificacao;
import com.gabrielnz.agendamento.entities.TipoDeNotificacao;
import com.gabrielnz.agendamento.entities.dtos.*;
import com.gabrielnz.agendamento.entities.exceptions.AgendamentoException;
import com.gabrielnz.agendamento.entities.exceptions.ServicosException;
import com.gabrielnz.agendamento.entities.exceptions.UsuarioException;
import com.gabrielnz.agendamento.feignclient.DisponibilidadeOcupadaFeingClient;
import com.gabrielnz.agendamento.feignclient.ServicoFeingClient;
import com.gabrielnz.agendamento.feignclient.UsuarioFeingClient;
import com.gabrielnz.agendamento.producer.NotificacaoProducer;
import com.gabrielnz.agendamento.repositories.AgendamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class AgendamentoServices {
    @Autowired
    private AgendamentoRepository agendamentoRepository;
    @Autowired
    UsuarioFeingClient usuarioFeingClient;
    @Autowired
    ServicoFeingClient servicoFeingClient;
    @Autowired
    DisponibilidadeOcupadaFeingClient disponibilidadeOcupadaFeingClient;
    @Autowired
    NotificacaoProducer notificacaoProducer;

    public Agendamento getAgendamentoPorId(Long id) {
        return agendamentoRepository.findById(id).orElseThrow(() -> new AgendamentoException("Agendamento não encontrado"));
    }

    public List<Agendamento> getTodosAgendamentos() {
        return agendamentoRepository.findAll();
    }

    @Transactional
    public Agendamento salvarAgendamento(Agendamento agendamento) {
        try {
            UsuarioDTO usuario = usuarioFeingClient.getPorId(agendamento.getClienteId()).getBody();
            ServicoDTO servico = servicoFeingClient.getPorId(agendamento.getServicoId()).getBody();
            if (usuario.getTipo() == Tipo.PRESTADOR) {
                throw new UsuarioException("O usuario precisa ser um Cliente");
            }
            AgendamentoDataDTO agendamentoInfo = new AgendamentoDataDTO();
            agendamentoInfo.setDataHora(agendamento.getDataHora());
            agendamentoInfo.setDataHoraFim(agendamento.getDataHora().plusMinutes(servico.duracaoMinutos()));
            agendamentoInfo.setPrestadorId(agendamento.getPrestadorId());
            if (!disponibilidadeOcupadaFeingClient.estaDisponivel(agendamentoInfo).getBody()) {
                throw new AgendamentoException("Disponibilidade ocupada, tente outra data/horario");
            }
            agendamento.setStatus(Status.PENDENTE);
            Agendamento agendamentoId = agendamentoRepository.save(agendamento);
            notificacaoProducer.enviarNotificacao(criarNotificacaoDTO(agendamentoId, servico, usuario, TipoDeNotificacao.AGENDAMENTO_PENDENTE)); // avisando o cliente
            notificacaoProducer.enviarNotificacao(criarNotificacaoDTO(agendamentoId, servico, usuario, TipoDeNotificacao.AGENDAMENTO_PENDENTE_PRESTADOR)); // avisando o prestador
            return agendamentoId;
        } catch (UsuarioException e) {
            throw new UsuarioException("Usuario nao econtrado");
        } catch (ServicosException e) {
            throw new ServicosException("Servico nao econtrado");
        }
    }

    @Transactional
    public Agendamento updateAgendamento(Agendamento agendamento) {
        UsuarioDTO usuario = usuarioFeingClient.getPorId(agendamento.getClienteId()).getBody();
        ServicoDTO servico = servicoFeingClient.getPorId(agendamento.getServicoId()).getBody();
        AgendamentoDataDTO agendamentoInfo = agendamentoParaDTO(agendamento);
        if (agendamento.getStatus() == Status.CONCLUIDO) {
            throw new AgendamentoException("Esse agendamento ja foi concluido.");
        } else if (agendamento.getStatus() == Status.AGENDADO) {
            if (disponibilidadeOcupadaFeingClient.estaDisponivel(agendamentoInfo).getBody()) {
                agendamento.setStatus(Status.PENDENTE);
                disponibilidadeOcupadaFeingClient.deletarDisponibilidade(agendamento.getDisponibilidadeOcupadaId());
                agendamento.setDisponibilidadeOcupadaId(null);
                notificacaoProducer.enviarNotificacao(criarNotificacaoDTO(agendamento, servico, usuario, TipoDeNotificacao.AGENDAMENTO_AGENDADO_ATUALIZADO));
                return agendamentoRepository.save(agendamento);
            } else {
                throw new AgendamentoException("Nada foi alterado, a data nova ja esta sendo ocupada por outro agendamento.");
            }
        } else if (agendamento.getStatus() == Status.PENDENTE) {
            if (disponibilidadeOcupadaFeingClient.estaDisponivel(agendamentoInfo).getBody()) {
                notificacaoProducer.enviarNotificacao(criarNotificacaoDTO(agendamento, servico, usuario, TipoDeNotificacao.AGENDAMENTO_PENDENTE_ATUALIZADO));
                return agendamentoRepository.save(agendamento);
            } else {
                throw new AgendamentoException("Nada foi alterado, a data nova ja esta sendo ocupada por outro agendamento.");
            }
        } else if (agendamento.getStatus() == Status.CANCELADO) {
            throw new AgendamentoException("Nada foi alterado, o agendamento ja esta cancelado.");
        } else if (agendamento.getStatus() == Status.RECUSADO) {
            throw new AgendamentoException("Nada foi alterado, este agendamento foi recusado. Crie um novo agendamento.");
        } else {
            throw new AgendamentoException("Nada foi alterado, ja passou da data, e o cliente faltou.");
        }
    }

    public void concluirAgendamento(Agendamento agendamento) {
        agendamento.setStatus(Status.CONCLUIDO);
        AgendamentoDataDTO agendamentoInfo = agendamentoParaDTO(agendamento);
        disponibilidadeOcupadaFeingClient.deletarDisponibilidade(agendamento.getDisponibilidadeOcupadaId());
        agendamento.setDisponibilidadeOcupadaId(null);
        agendamentoRepository.save(agendamento);
    }

    @Transactional
    public void deletarCancelarAgendamento(Long id) {
        if (agendamentoRepository.existsById(id)) {
            Agendamento agendamento = agendamentoRepository.getById(id);
            if (agendamento.getStatus() == Status.PENDENTE) {
                agendamentoRepository.deleteById(id);
            } else if (agendamento.getStatus() == Status.AGENDADO) {
                disponibilidadeOcupadaFeingClient.deletarDisponibilidade(agendamento.getDisponibilidadeOcupadaId());
                agendamento.setDisponibilidadeOcupadaId(null);
                agendamento.setStatus(Status.CANCELADO);
                agendamentoRepository.save(agendamento);
            }
        } else {
            throw new AgendamentoException("Agendamento não encontrado ou não pode ser deletado");
        }
    }

    // colocar Security para garantir que quem chama o metodo é o prestador do servido do agendamento
    public Agendamento aprovarAgendamento(Long id) {
        Agendamento agendamento = getAgendamentoPorId(id);
        UsuarioDTO usuario = usuarioFeingClient.getPorId(agendamento.getClienteId()).getBody();
        ServicoDTO servico = servicoFeingClient.getPorId(agendamento.getServicoId()).getBody();
        AgendamentoDataDTO agentamentoInfo = agendamentoParaDTO(agendamento);
        if (agendamento.getStatus() == Status.PENDENTE) {
            if (disponibilidadeOcupadaFeingClient.estaDisponivel(agentamentoInfo).getBody()) {
                agendamento.setStatus(Status.AGENDADO);
                agendamento.setDisponibilidadeOcupadaId(disponibilidadeOcupadaFeingClient.salvarDisponibilidade(agentamentoInfo).getBody().id());
                agendamentoRepository.save(agendamento);
                notificacaoProducer.enviarNotificacao(criarNotificacaoDTO(agendamento, servico, usuario, TipoDeNotificacao.AGENDAMENTO_APROVADO));
                return agendamentoRepository.save(agendamento);
            } else {
                throw new AgendamentoException("Disponibilidade ocupada, a data deste agendamento esta sendo ocupada por outro ja aprovado");
            }
        } else if (agendamento.getStatus() == Status.AGENDADO) {
            throw new AgendamentoException("O agendamento ja foi aprovado");
        } else if (agendamento.getStatus() == Status.CONCLUIDO) {
            throw new AgendamentoException("O agendamento ja foi concluido");
        } else if (agendamento.getStatus() == Status.CANCELADO) {
            throw new AgendamentoException("Impossivel aprovar agendamento, o mesmo ja foi cancelado");
        } else {
            throw new AgendamentoException("Impossivel aprovar, ja passou da data e o cliente faltou.");
        }
    }

    // colocar Security para garantir que quem chama o metodo é o prestador do servido do agendamento
    public Agendamento recusarCancelarAgendamento(Long id) {
        Agendamento agendamento = getAgendamentoPorId(id);
        UsuarioDTO usuario = usuarioFeingClient.getPorId(agendamento.getClienteId()).getBody();
        ServicoDTO servico = servicoFeingClient.getPorId(agendamento.getServicoId()).getBody();
        AgendamentoDataDTO agendamentoInfo = agendamentoParaDTO(agendamento);
        if (agendamento.getStatus() == Status.PENDENTE) {
            agendamento.setStatus(Status.RECUSADO);
            notificacaoProducer.enviarNotificacao(criarNotificacaoDTO(agendamento, servico, usuario, TipoDeNotificacao.AGENDAMENTO_RECUSADO));
            return agendamentoRepository.save(agendamento);
        } else if (agendamento.getStatus() == Status.AGENDADO) {
            agendamento.setStatus(Status.CANCELADO);
            disponibilidadeOcupadaFeingClient.deletarDisponibilidade(agendamento.getDisponibilidadeOcupadaId());
            notificacaoProducer.enviarNotificacao(criarNotificacaoDTO(agendamento, servico, usuario, TipoDeNotificacao.AGENDAMENTO_AGENDADO_CANCELADO));
            return agendamentoRepository.save(agendamento);
        } else if (agendamento.getStatus() == Status.CONCLUIDO) {
            throw new AgendamentoException("O agendamento ja foi concluido");
        } else if (agendamento.getStatus() == Status.CANCELADO) {
            throw new AgendamentoException("O agendamento ja foi cancelado");
        } else {
            throw new AgendamentoException("Impossivel recusar, ja passou da data e o cliente faltou.");
        }
    }

    public AgendamentoDataDTO agendamentoParaDTO(Agendamento agendamento) {
        ServicoDTO servico = servicoFeingClient.getPorId(agendamento.getServicoId()).getBody();
        AgendamentoDataDTO agendamentoInfo = new AgendamentoDataDTO();
        agendamentoInfo.setDataHora(agendamento.getDataHora());
        agendamentoInfo.setDataHoraFim(agendamento.getDataHora().plusMinutes(servico.duracaoMinutos()));
        agendamentoInfo.setPrestadorId(agendamento.getPrestadorId());
        return agendamentoInfo;
    }

    public Agendamento confirmarFalta(Long id) {
        Agendamento agendamento = getAgendamentoPorId(id);
        if(LocalDateTime.now().isAfter(agendamento.getDataHora().plusDays(1))) {
            throw new AgendamentoException("O agendamento ja foi concluido à 24 horas, não sera possivel marcar falta do cliente");
        }
        UsuarioDTO usuario = usuarioFeingClient.getPorId(agendamento.getClienteId()).getBody();
        ServicoDTO servico = servicoFeingClient.getPorId(agendamento.getServicoId()).getBody();
        agendamento.setStatus(Status.FALTOU);
        notificacaoProducer.enviarNotificacao(criarNotificacaoDTO(agendamento, servico, usuario, TipoDeNotificacao.AVISAR_FALTA));
        usuario.setFaltas(usuario.getFaltas() + 1);
        usuarioFeingClient.atualizarUsuario(usuario);
        return agendamentoRepository.save(agendamento);
    }

    public NotificacaoDTO criarNotificacaoDTO(Agendamento agendamento, ServicoDTO servicoDTO, UsuarioDTO usuarioDTO, TipoDeNotificacao tipoDeNotificacao) {
        NotificacaoDTO notificacao = new NotificacaoDTO();
        UsuarioDTO prestador = usuarioFeingClient.getPorId(servicoDTO.prestador_id()).getBody();
        notificacao.setAgendamentoId(agendamento.getId());
        notificacao.setUsuarioId(agendamento.getClienteId());
        notificacao.setUsuarioNome(usuarioDTO.getNome());
        notificacao.setUsuarioEmail(usuarioDTO.getEmail());
        notificacao.setServicoNome(servicoDTO.nome());
        notificacao.setTipoDeNotificacao(tipoDeNotificacao);
        notificacao.setDataHora(LocalDateTime.now());
        notificacao.setStatus(StatusNotificacao.PENDENTE);
        notificacao.setTentativas(1);
        notificacao.setPrestadorEmail(prestador.getEmail());
        notificacao.setDataHoraAgendamento(agendamento.getDataHora());
        return notificacao;
    }
}
