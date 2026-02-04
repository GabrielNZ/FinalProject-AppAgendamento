package com.gabrielnz.usuario.services;

import com.gabrielnz.usuario.entities.Disponibilidade;
import com.gabrielnz.usuario.entities.Usuario;
import com.gabrielnz.usuario.entities.exceptions.UsuarioException;
import com.gabrielnz.usuario.repositories.DisponibilidadeRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DisponibilidadeService {
    @Autowired
    private DisponibilidadeRepository disponibilidadeRepository;

    public Disponibilidade getDisponibilidadePorId(Long id) {
        return disponibilidadeRepository.findById(id).orElseThrow(() -> new UsuarioException("Disponibilidade não encontrada para esse usuario."));
    }
    public List<Disponibilidade> getDisponibilidadePorIdPrestador(Long idPrestador) {
        return disponibilidadeRepository.findByPrestadorId(idPrestador);
    }

    public List<Disponibilidade> getTodasDisponibilidades() {
        return disponibilidadeRepository.findAll();
    }
    public Disponibilidade saveDisponibilidade(Disponibilidade disponibilidade) {
        System.out.println(disponibilidade.getPrestadorId());
        return disponibilidadeRepository.save(disponibilidade);
    }
    @Transactional
    public Disponibilidade updateDisponibilidade(Disponibilidade disponibilidade) {
        return disponibilidadeRepository.save(disponibilidade);
    }

    @Transactional
    public void deletarDisponibilidade(Long id) {
        if (disponibilidadeRepository.existsById(id)) {
            disponibilidadeRepository.deleteById(id);
        } else {
            throw new UsuarioException("Disponibilidade não encontrada.");
        }
    }
}
