package com.gabrielnz.agendamento.services;

import com.gabrielnz.agendamento.entities.Agendamento;
import com.gabrielnz.agendamento.entities.Status;
import com.gabrielnz.agendamento.entities.TipoDeNotificacao;
import com.gabrielnz.agendamento.entities.dtos.ServicoDTO;
import com.gabrielnz.agendamento.entities.dtos.UsuarioDTO;
import com.gabrielnz.agendamento.feignclient.ServicoFeingClient;
import com.gabrielnz.agendamento.feignclient.UsuarioFeingClient;
import com.gabrielnz.agendamento.producer.NotificacaoProducer;
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
    UsuarioFeingClient usuarioFeingClient;
    @Autowired
    ServicoFeingClient servicoFeingClient;
    @Autowired
    NotificacaoProducer notificacaoProducer;

    @Scheduled(cron = "0 0 0 * * *")
    public void confirmarAgendamento() {
        List<Agendamento> agendamentosConcluidos = agendamentoServices.getTodosAgendamentos().stream().filter(x -> x.getStatus() == Status.AGENDADO).filter(x -> x.getDataHora().isBefore(LocalDateTime.now())).toList();
        for(Agendamento agendamento : agendamentosConcluidos){
            agendamentoServices.concluirAgendamento(agendamento);
            UsuarioDTO usuario = usuarioFeingClient.getPorId(agendamento.getClienteId()).getBody();
            ServicoDTO servico = servicoFeingClient.getPorId(agendamento.getServicoId()).getBody();
            notificacaoProducer.enviarNotificacao(agendamentoServices.criarNotificacaoDTO(agendamento,servico,usuario, TipoDeNotificacao.CONFIRMAR_PRESENCA));
        }
    }
}
