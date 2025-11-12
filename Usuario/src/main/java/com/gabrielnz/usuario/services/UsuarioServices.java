package com.gabrielnz.usuario.services;

import com.gabrielnz.usuario.entities.Usuario;
import com.gabrielnz.usuario.entities.exceptions.UsuarioException;
import com.gabrielnz.usuario.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioServices {
    @Autowired
    private UsuarioRepository usuarioRepository;

    public Usuario getUsuarioPorId(Long id) {
        return usuarioRepository.findById(id).orElseThrow(() -> new UsuarioException("Usuario não encontrado"));
    }
    public List<Usuario> getTodosUsuarios() {
        return usuarioRepository.findAll();
    }
    @Transactional
    public Usuario updateUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
    @Transactional
    public void deletarUsuario(Long id) {
        if(usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
        }else{
            throw new UsuarioException("Usuario não encontrado");
        }
    }
}
