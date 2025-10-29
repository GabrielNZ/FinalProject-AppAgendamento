package com.gabrielnz.servicos.controllers;

import com.gabrielnz.servicos.entities.Servicos;
import com.gabrielnz.servicos.services.ServicosServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class ServicosController {
    @Autowired
    private ServicosServices servicosServices;

    @GetMapping("{/id}")
    public ResponseEntity<Servicos> getPorId(@PathVariable Long id){
        return ResponseEntity.ok().body(servicosServices.getServicoPorId(id));
    }
    @GetMapping
    public ResponseEntity<List<Servicos>> getTodosServicos(){
        return ResponseEntity.ok().body(servicosServices.getTodosServicos());
    }
    @PostMapping
    public ResponseEntity<Servicos> criarServico(@RequestBody Servicos servico){
        return ResponseEntity.ok().body(servicosServices.salvarServico(servico));
    }
    @PutMapping
    public ResponseEntity<Servicos> atualizarServico(@RequestBody Servicos servico){
        return ResponseEntity.ok().body(servicosServices.salvarServico(servico));
    }
    @DeleteMapping("{/id}")
    public ResponseEntity<Void> deletarServico(@PathVariable Long id) {
        servicosServices.deletarServico(id);
        return ResponseEntity.noContent().build();
    }
}
