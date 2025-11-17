package com.gabrielnz.agendamento.entities.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class UsuarioDTO {
    private Long id;
    private String nome;
    @Email
    private String email;
    private String senha;
    @Enumerated(EnumType.STRING)
    private Tipo tipo;
    private Integer faltas;
}
