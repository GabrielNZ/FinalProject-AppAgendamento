package com.gabrielnz.usuario.entities;

import jakarta.validation.constraints.Email;

public record LoginDTO(@Email String email, String senha) {
}
