package com.gabrielnz.notificacao.services;

import com.gabrielnz.notificacao.entities.*;
import com.gabrielnz.notificacao.entities.exceptions.NotificacaoException;
import com.gabrielnz.notificacao.repositories.NotificacaoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class NotificacaoService {
    @Autowired
    private NotificacaoRepository notificacaoRepository;
    @Autowired
    JavaMailSender mailSender;

    public Notificacao getPorId(Long id) {
        return notificacaoRepository.findById(id).orElseThrow(() -> new NotificacaoException("Notificação não encontrada"));
    }

    public List<Notificacao> getAll() {
        return notificacaoRepository.findAll();
    }

    public List<Notificacao> getByIdUsuario(Long idUsuario) {
        return notificacaoRepository.findAllByUsuarioId(idUsuario);
    }

    public List<Notificacao> getByStatus(StatusNotificacao status) {
        return notificacaoRepository.findByStatusIn(List.of(status));
    }

    public void delete(Long id) {
        if (notificacaoRepository.existsById(id)) {
            notificacaoRepository.deleteById(id);
        } else {
            throw new NotificacaoException("Notificação não encontrada");
        }
    }

    public void enviarEmail(Notificacao notificacao) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            EmailDTO emailDTO = conteudoEmail(notificacao);
            mailMessage.setTo(emailDTO.getEmailPara());
            mailMessage.setSubject(emailDTO.getSubject());
            mailMessage.setText(emailDTO.getText());
            log.info("Tentando enviar e-mail para {}", notificacao.getUsuarioEmail());
            mailSender.send(mailMessage);
            notificacao.setStatus(StatusNotificacao.ENVIADO);
            notificacaoRepository.save(notificacao);
        } catch (MailException e) {
            notificacao.setStatus(StatusNotificacao.FALHOU);
            log.error("Falha ao enviar e-mail: {}", e.getMessage());
            notificacaoRepository.save(notificacao);
        }
    }

    public EmailDTO conteudoEmail(Notificacao notificacao) {
        EmailDTO email = new EmailDTO();
        if (notificacao.getTipoDeNotificacao().equals(TipoDeNotificacao.AGENDAMENTO_APROVADO)) {
            email.setSubject("✅ Seu agendamento foi aprovado!");
            email.setText("""
                    Olá, %s!
                    
                    Seu agendamento de %s foi aprovado com sucesso ✅
                    Data/Horário: %s
                    
                    Até mais!
                    """.formatted(notificacao.getUsuarioNome(), notificacao.getServicoNome(), notificacao.getDataHora().toString()));
            email.setEmailPara(notificacao.getUsuarioEmail());
        } else if (notificacao.getTipoDeNotificacao().equals(TipoDeNotificacao.AGENDAMENTO_RECUSADO)) {
            email.setSubject("❌ Seu agendamento foi recusado");
            email.setText("""
                    Olá, %s.
                    
                    Infelizmente seu agendamento de %s foi recusado. 
                    Você pode tentar reagendar em outro horário ✅
                    
                    Data/Horário solicitado: %s
                    """.formatted(notificacao.getUsuarioNome(), notificacao.getServicoNome(), notificacao.getDataHora().toString()));
            email.setEmailPara(notificacao.getUsuarioEmail());
        } else if (notificacao.getTipoDeNotificacao().equals(TipoDeNotificacao.AGENDAMENTO_AGENDADO_CANCELADO)) {
            email.setSubject("⚠️ Seu agendamento foi cancelado");
            email.setText("""
                    Olá, %s.
                    
                    Seu agendamento de %s foi cancelado.
                    Se desejar, estamos aqui para remarcar ✅
                    
                    Data/Horário original: %s
                    """.formatted(notificacao.getUsuarioNome(), notificacao.getServicoNome(), notificacao.getDataHora().toString()));
            email.setEmailPara(notificacao.getUsuarioEmail());
        } else if (notificacao.getTipoDeNotificacao().equals(TipoDeNotificacao.AGENDAMENTO_AGENDADO_ATUALIZADO)) {
            email.setSubject("✏️ Seu agendamento foi atualizado!");
            email.setText("""
                    Olá, %s!
                    
                    Seu agendamento foi atualizado com sucesso ✨
                    Agora fique no aguardo da confirmação do prestador
                    Serviço: %s
                    Novo horário: %s
                    
                    Obrigado por usar nosso serviço!
                    """.formatted(notificacao.getUsuarioNome(), notificacao.getServicoNome(), notificacao.getDataHora().toString()));
            email.setEmailPara(notificacao.getUsuarioEmail());
        } else if (notificacao.getTipoDeNotificacao().equals(TipoDeNotificacao.AGENDAMENTO_PENDENTE)) {
            email.setSubject("⏳ Seu agendamento está pendente");
            email.setText("""
                    Olá, %s!
                    
                    Seu agendamento foi criado e está aguardando confirmação do prestador ✅
                    
                    Serviço: %s
                    Data/Horário: %s
                    """.formatted(notificacao.getUsuarioNome(), notificacao.getServicoNome(), notificacao.getDataHora().toString()));
            email.setEmailPara(notificacao.getUsuarioEmail());
        } else if (notificacao.getTipoDeNotificacao().equals(TipoDeNotificacao.CONFIRMAR_PRESENCA)) {
            email.setSubject("📌 Confirme a presença do cliente");
            email.setText("""
                    Olá!
                    
                    O cliente %s compareceu ao agendamento do serviço: %s ?
                    
                    ✅ Se sim nada precisa ser feito!
                    ❌ Caso não! -> Confirme falta em até 24 horas, após este periodo sera marcado permanentemente como presença.
                    
                    Data/Horário: %s
                    
                    Confirme a presença no sistema para finalizar o atendimento.
                    """.formatted(notificacao.getUsuarioNome(), notificacao.getServicoNome(), notificacao.getDataHora().toString()));
            email.setEmailPara(notificacao.getPrestadorEmail());
        } else if (notificacao.getTipoDeNotificacao().equals(TipoDeNotificacao.AVISAR_FALTA)) {
            email.setSubject("⚠️ Você não compareceu ao seu agendamento");
            email.setText("""
                    Olá, %s!
                    
                    Identificamos que você não compareceu ao agendamento de %s ❌
                    
                    Data/Horário: %s
                    
                    Caso isso seja um engano entre em contato com nosso suporte!
                    Porem esteja ciente que não ter avisado previamente registra uma falta em seu perfil!
                    """.formatted(notificacao.getUsuarioNome(), notificacao.getServicoNome(), notificacao.getDataHora().toString()));
            email.setEmailPara(notificacao.getUsuarioEmail());
        } else { //AGENDAMENTO_PENDENTE_ATUALIZADO
            email.setSubject("ℹ️ Atualização de agendamento pendente");
            email.setText("""
                    Olá, %s!
                    
                    Seu agendamento pendente foi atualizado.
                    Serviço: %s
                    Novo horário: %s
                    
                    Em breve você receberá a confirmação ✅
                    """.formatted(notificacao.getUsuarioNome(), notificacao.getServicoNome(), notificacao.getDataHora().toString()));
            email.setEmailPara(notificacao.getUsuarioEmail());
        }
        return email;
    }

    @Scheduled(fixedDelay = 60000)
    public void reenviar() {
        List<Notificacao> pendentes = notificacaoRepository.findByStatusInAndTentativasLessThan(List.of(StatusNotificacao.PENDENTE, StatusNotificacao.FALHOU), 5);

        pendentes.forEach(n ->
                {
                    n.setTentativas(n.getTentativas() + 1);
                    enviarEmail(n);
                }
        );
    }
}
