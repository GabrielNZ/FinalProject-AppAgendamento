package com.gabrielnz.usuario.services;

import com.gabrielnz.usuario.entities.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Instant;
import java.util.Date;


@Service
public class TokenService {
    @Value("${jwt.secret}")
    private String tokenKey;

    @Value("${jwt.expiration}")
    private Long duracaoToken;

    private Key getTokenAutenticado(){
        return Keys.hmacShaKeyFor(tokenKey.getBytes());
    }

    public String criarToken(Usuario usuario) {
        return Jwts.builder()
                .setSubject(usuario.getEmail())
                .claim("tipo",usuario.getTipo())
                .setIssuedAt(Date.from(Instant.now()))
                .setExpiration(new Date(System.currentTimeMillis() + duracaoToken))
                .signWith(getTokenAutenticado(), SignatureAlgorithm.HS256)
                .compact();
    }
    public String getUsuarioEmailToken(String token) {
        return verificarToken(token).getSubject();
    }

    private Claims verificarToken(String token) {
        return Jwts.parserBuilder().setSigningKey(getTokenAutenticado()).build().parseClaimsJws(token).getBody();
    }
}