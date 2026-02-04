package com.gabrielnz.usuario.controllers;

import com.gabrielnz.usuario.entities.Disponibilidade;
import com.gabrielnz.usuario.entities.Tipo;
import com.gabrielnz.usuario.entities.Usuario;
import com.gabrielnz.usuario.services.DisponibilidadeService;
import com.gabrielnz.usuario.services.UsuarioServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {
    @Autowired
    private UsuarioServices usuarioServices;
    @Autowired
    private DisponibilidadeService disponibilidadeService;

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getPorId(@PathVariable Long id){
        return ResponseEntity.ok().body(usuarioServices.getUsuarioPorId(id));
    }
    @GetMapping("/disponibilidade/{id}")
    public ResponseEntity<Disponibilidade> getDisponibilidadePorId(@PathVariable Long id){
        return ResponseEntity.ok().body(disponibilidadeService.getDisponibilidadePorId(id));
    }
    @GetMapping("/disponibilidade/prestador/{id}")
    public ResponseEntity<List<Disponibilidade>> getDisponibilidadePorIdPrestador(@PathVariable Long id){
        return ResponseEntity.ok().body(disponibilidadeService.getDisponibilidadePorIdPrestador(id));
    }
    @PostMapping("/disponibilidade/prestador")
    public ResponseEntity<Disponibilidade> saveDisponibilidade(@RequestBody Disponibilidade disponibilidade){
        return ResponseEntity.ok().body(disponibilidadeService.saveDisponibilidade(disponibilidade));
    }
    @PutMapping("/disponibilidade/prestador")
    public ResponseEntity<Disponibilidade> updateDisponibilidade(@RequestBody Disponibilidade disponibilidade){
        return ResponseEntity.ok().body(disponibilidadeService.updateDisponibilidade(disponibilidade));
    }
    @DeleteMapping("/disponibilidade/prestador/{id}")
    public ResponseEntity<Void> deletarDisponibilidade(@PathVariable Long id) {
        disponibilidadeService.deletarDisponibilidade(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping
    public ResponseEntity<List<Usuario>> getTodosUsuarios(){
        return ResponseEntity.ok().body(usuarioServices.getTodosUsuarios());
    }
    @PutMapping
    public ResponseEntity<Usuario> atualizarUsuario(@RequestBody Usuario usuario){
        return ResponseEntity.ok().body(usuarioServices.updateUsuario(usuario));
    }
    @PutMapping("/{id}/role")
    public ResponseEntity<Usuario> trocarRoleUsuario(@PathVariable Long id, @RequestBody Tipo tipo){
        Usuario usuario = usuarioServices.getUsuarioPorId(id);
        usuario.setTipo(tipo);
        return ResponseEntity.ok().body(usuarioServices.updateUsuario(usuario));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarUsuario(@PathVariable Long id) {
        usuarioServices.deletarUsuario(id);
        return ResponseEntity.noContent().build();
    }
}
