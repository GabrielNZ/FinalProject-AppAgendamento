package com.gabrielnz.usuario.controllers;

import com.gabrielnz.usuario.entities.LoginDTO;
import com.gabrielnz.usuario.entities.Usuario;
import com.gabrielnz.usuario.repositories.UsuarioRepository;
import com.gabrielnz.usuario.services.TokenService;
import jakarta.validation.constraints.Email;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private TokenService tokenService;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<String> registrarUsuario(@RequestBody Usuario usuario) {
        if (usuarioRepository.findByEmail(usuario.getEmail()) != null) {
            return ResponseEntity.badRequest().body("E-mail já registrado.");
        }
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        usuarioRepository.save(usuario);
        String token = tokenService.criarToken(usuario);
        return ResponseEntity.ok().header(HttpHeaders.AUTHORIZATION, "Bearer " + token).body("Usuario: "+usuario.getTipo().name()+" registrado com sucesso.");
    }

    @PostMapping("/login")
    public ResponseEntity<String> autenticarUsuario(@RequestBody LoginDTO loginDTO) {
        Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginDTO.email(), loginDTO.senha()));
        Usuario usuario = (Usuario) auth.getPrincipal();
        String token = tokenService.criarToken(usuario);
        return ResponseEntity.ok().header(HttpHeaders.AUTHORIZATION, "Bearer " + token).body("Usuario: "+usuario.getTipo().name()+" autenticado com sucesso.");
    }
}
