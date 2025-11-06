package com.gabrielnz.agendamento.services;

import com.gabrielnz.agendamento.entities.Agendamento;
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

    @Scheduled(cron = "0 0 0 * * *")
    public void confirmarAgendamento() {
        List<Agendamento> agendamentosConcluidos = agendamentoServices.getTodosAgendamentos().stream().filter(x -> x.getDataHora().isBefore(LocalDateTime.now())).toList();
        for(Agendamento agendamento : agendamentosConcluidos){
            agendamentoServices.concluirAgendamento(agendamento);
            //enviar mensagem para o prestador pedindo confirmação da presença do cliente, para declarar como falta se for o caso.
        }
    }
}
