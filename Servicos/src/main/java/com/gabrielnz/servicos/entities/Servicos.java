package com.gabrielnz.servicos.entities;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "tb_servicos")
public class Servicos {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String nome;
    private String descricao;
    private Integer duracaoMinutos;
    private Double preco;

    private Long prestador_id;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Integer getDuracaoMinutos() {
        return duracaoMinutos;
    }

    public void setDuracaoMinutos(Integer duracaoMinutos) {
        this.duracaoMinutos = duracaoMinutos;
    }

    public Double getPreco() {
        return preco;
    }

    public void setPreco(Double preco) {
        this.preco = preco;
    }

    public Long getPrestador_id() {
        return prestador_id;
    }

    public void setPrestador_id(Long prestador_id) {
        this.prestador_id = prestador_id;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Servicos servicos = (Servicos) o;
        return Objects.equals(id, servicos.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
