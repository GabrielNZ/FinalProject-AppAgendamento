package com.gabrielnz.servicos.services;

import com.gabrielnz.servicos.entities.Servicos;
import com.gabrielnz.servicos.entities.exceptions.ServicosException;
import com.gabrielnz.servicos.repositories.ServicosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ServicosServices {
    @Autowired
    private ServicosRepository servicosRepository;

    public Servicos getServicoPorId(Long id) {
        return servicosRepository.findById(id).orElseThrow(() -> new ServicosException("Usuario não encontrado"));
    }
    public List<Servicos> getTodosServicos() {
        return servicosRepository.findAll();
    }
    @Transactional
    public Servicos salvarServico(Servicos servico) {
        return servicosRepository.save(servico);
    }
    @Transactional
    public Servicos updateServico(Servicos usuario) {
        return servicosRepository.save(usuario);
    }
    @Transactional
    public void deletarServico(Long id) {
        if(servicosRepository.existsById(id)) {
            servicosRepository.deleteById(id);
        }else{
            throw new ServicosException("Usuario não encontrado");
        }
    }
}
