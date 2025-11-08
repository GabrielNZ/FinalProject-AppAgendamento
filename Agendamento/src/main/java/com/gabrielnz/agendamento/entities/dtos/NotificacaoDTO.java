package com.gabrielnz.agendamento.entities.dtos;

import com.gabrielnz.agendamento.entities.StatusNotificacao;
import com.gabrielnz.agendamento.entities.TipoDeNotificacao;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;

import java.time.LocalDateTime;

public class NotificacaoDTO {
    private Long id;
    private Long agendamentoId;
    private String servicoNome;
    private Long usuarioId;
    private String usuarioNome;
    @Email
    private String usuarioEmail;
    @Email
    private String prestadorEmail;
    private LocalDateTime dataHora;
    @Enumerated(EnumType.STRING)
    private StatusNotificacao status;
    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private TipoDeNotificacao tipoDeNotificacao;
    private LocalDateTime dataHoraAgendamento;
    private Integer tentativas;
    //tentativas de reenviar, para evitar sobrecarga em notificações que nao enviam de jeito nenhum

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAgendamentoId() {
        return agendamentoId;
    }

    public void setAgendamentoId(Long agendamentoId) {
        this.agendamentoId = agendamentoId;
    }

    public @Email String getUsuarioEmail() {
        return usuarioEmail;
    }

    public void setUsuarioEmail(@Email String usuarioEmail) {
        this.usuarioEmail = usuarioEmail;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public StatusNotificacao getStatus() {
        return status;
    }

    public void setStatus(StatusNotificacao status) {
        this.status = status;
    }

    public TipoDeNotificacao getTipoDeNotificacao() {
        return tipoDeNotificacao;
    }

    public void setTipoDeNotificacao(TipoDeNotificacao tipoDeNotificacao) {
        this.tipoDeNotificacao = tipoDeNotificacao;
    }

    public String getServicoNome() {
        return servicoNome;
    }

    public void setServicoNome(String servicoNome) {
        this.servicoNome = servicoNome;
    }

    public String getUsuarioNome() {
        return usuarioNome;
    }

    public void setUsuarioNome(String usuarioNome) {
        this.usuarioNome = usuarioNome;
    }

    public Integer getTentativas() {
        return tentativas;
    }

    public void setTentativas(Integer tentativas) {
        this.tentativas = tentativas;
    }

    public @Email String getPrestadorEmail() {
        return prestadorEmail;
    }

    public void setPrestadorEmail(@Email String prestadorEmail) {
        this.prestadorEmail = prestadorEmail;
    }

    public LocalDateTime getDataHoraAgendamento() {
        return dataHoraAgendamento;
    }

    public void setDataHoraAgendamento(LocalDateTime dataHoraAgendamento) {
        this.dataHoraAgendamento = dataHoraAgendamento;
    }
}


