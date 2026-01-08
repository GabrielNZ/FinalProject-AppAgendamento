package com.gabrielnz.usuario.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_disponibilidade_prestador")
public class Disponibilidade {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long idDisponibilidade;
    @ManyToOne
    @JoinColumn(name = "prestador_id")
    private Usuario usuario;
    private String diaDaSemana;
    private LocalDateTime inicio;
    private LocalDateTime fim;

    public Long getIdDisponibilidade() {
        return idDisponibilidade;
    }

    public void setIdDisponibilidade(Long idDisponibilidade) {
        this.idDisponibilidade = idDisponibilidade;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getDiaDaSemana() {
        return diaDaSemana;
    }

    public void setDiaDaSemana(String diaDaSemana) {
        this.diaDaSemana = diaDaSemana;
    }

    public LocalDateTime getInicio() {
        return inicio;
    }

    public void setInicio(LocalDateTime inicio) {
        this.inicio = inicio;
    }

    public LocalDateTime getFim() {
        return fim;
    }

    public void setFim(LocalDateTime fim) {
        this.fim = fim;
    }
}
