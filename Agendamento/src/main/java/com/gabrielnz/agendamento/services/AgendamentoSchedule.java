package com.gabrielnz.agendamento.services;

import com.gabrielnz.agendamento.entities.Agendamento;
import com.gabrielnz.agendamento.entities.Status;
import com.gabrielnz.agendamento.entities.TipoDeNotificacao;
import com.gabrielnz.agendamento.entities.dtos.ServicoDTO;
import com.gabrielnz.agendamento.entities.dtos.UsuarioDTO;
import com.gabrielnz.agendamento.feignclient.ServicoFeingClient;
import com.gabrielnz.agendamento.feignclient.UsuarioFeingClient;
import com.gabrielnz.agendamento.producer.NotificacaoProducer;
import com.gabrielnz.agendamento.repositories.AgendamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@EnableScheduling
@Service
public class AgendamentoSchedule {
    @Autowired
    private AgendamentoServices agendamentoServices;
    @Autowired
    private AgendamentoRepository agendamentoRepository;
    @Autowired
    UsuarioFeingClient usuarioFeingClient;
    @Autowired
    ServicoFeingClient servicoFeingClient;
    @Autowired
    NotificacaoProducer notificacaoProducer;

    @Scheduled(cron = "0 0 0 * * *")
    public void confirmarAgendamento() {
        List<Agendamento> agendamentosConcluidos = agendamentoRepository.findAgendamentosParaConcluir(Status.CONCLUIDO,LocalDateTime.now());
        for(Agendamento agendamento : agendamentosConcluidos){
            try {
                agendamentoServices.concluirAgendamento(agendamento);
                UsuarioDTO usuario = usuarioFeingClient.getPorId(agendamento.getClienteId()).getBody();
                ServicoDTO servico = servicoFeingClient.getPorId(agendamento.getServicoId()).getBody();
                notificacaoProducer.enviarNotificacao(agendamentoServices.criarNotificacaoDTO(agendamento,servico,usuario, TipoDeNotificacao.CONFIRMAR_PRESENCA));
            } catch (Exception e) {
                System.err.println("Erro ao processar agendamento ID " + agendamento.getId() + ": " + e.getMessage());
            }
        }
    }
}
