package com.gabrielnz.agendamento.entities.dtos;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
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
