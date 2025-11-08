package com.gabrielnz.agendamento.producer;

import com.gabrielnz.agendamento.entities.dtos.NotificacaoDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class NotificacaoProducer {
    @Autowired
    RabbitTemplate rabbitTemplate;

    @Value("${broker.queue.email.name}")
    private String queueEmail;

    public void enviarNotificacao(NotificacaoDTO notificacao) {
        try{
            log.info("Enviando requisicao de notificacao do tipo: {}",notificacao.getTipoDeNotificacao());
            rabbitTemplate.convertAndSend("", queueEmail, notificacao);
            log.info("Notificacao enviada para a fila. Tipo: {}",notificacao.getTipoDeNotificacao());
        }catch (Exception e){
            log.error("Erro ao enviar mensagem para a fila: {}",e.getMessage());
        }
    }
}
