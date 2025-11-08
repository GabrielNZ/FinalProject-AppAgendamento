package com.gabrielnz.notificacao.consumers;

import com.gabrielnz.notificacao.entities.NotificacaoDTO;
import com.gabrielnz.notificacao.services.NotificacaoService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
public class NotificacaoConsumer {
    @Autowired
    NotificacaoService notificacaoService;

    @RabbitListener(queues = "${broker.queue.email.name}")
    public void emailQueue(@Payload NotificacaoDTO notificacao) {
        notificacaoService.enviarEmail(notificacao);
    }
}
