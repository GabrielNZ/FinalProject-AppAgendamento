package com.gabrielnz.disponibilidadeocupacada.services;

import com.gabrielnz.disponibilidadeocupacada.entities.dtos.AgendamentoDataDTO;
import com.gabrielnz.disponibilidadeocupacada.entities.exceptions.DisponibilidadeException;
import com.gabrielnz.disponibilidadeocupacada.entities.DisponibilidadeOcupada;
import com.gabrielnz.disponibilidadeocupacada.repositories.DisponibilidadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DisponibilidadeService {
    @Autowired
    private DisponibilidadeRepository disponibilidadeRepository;

    public DisponibilidadeOcupada getPorId(Long id){
        return disponibilidadeRepository.findById(id).orElseThrow(() -> new DisponibilidadeException("Disponibilidade esta livre, não há registros dessa data."));
    }

    public List<DisponibilidadeOcupada> getDisponibilidadesPorId(Long id) {
        return disponibilidadeRepository.findAllByPrestadorId(id);
    }
    public Boolean estaDisponivel(AgendamentoDataDTO dataAgendamento) {
        LocalDateTime novoInicio = dataAgendamento.getDataHora();
        LocalDateTime novoFim = dataAgendamento.getDataHoraFim();

        LocalDateTime inicioDoDiaNovo = novoInicio.toLocalDate().atStartOfDay();
        LocalDateTime fimDoDiaNovo = inicioDoDiaNovo.plusDays(1);

        List<DisponibilidadeOcupada> ocupadosDoDia = disponibilidadeRepository.findAllByPrestadorIdAndDataHoraInicioBetween(dataAgendamento.getPrestadorId(), inicioDoDiaNovo, fimDoDiaNovo);

        boolean existeConflito = ocupadosDoDia.stream().anyMatch(ocupada -> ocupada.getDataHoraInicio() != null && ocupada.getDataHoraFim() != null && novoInicio.isBefore(ocupada.getDataHoraFim()) && novoFim.isAfter(ocupada.getDataHoraInicio()));

        return !existeConflito;
    }
    @Transactional
    public DisponibilidadeOcupada salvarDisponibilidade(AgendamentoDataDTO dataAgendamento) {
        DisponibilidadeOcupada disponibilidade = new DisponibilidadeOcupada();
        disponibilidade.setPrestadorId(dataAgendamento.getPrestadorId());
        disponibilidade.setDataHoraInicio(dataAgendamento.getDataHora());
        disponibilidade.setDataHoraFim(dataAgendamento.getDataHoraFim());
        return disponibilidadeRepository.save(disponibilidade);
    }
    @Transactional
    public DisponibilidadeOcupada updateDisponibilidade(Long id, AgendamentoDataDTO dataAgendamento) {
        DisponibilidadeOcupada disponibilidadeOcupada = getPorId(id);
        if(estaDisponivel(dataAgendamento)){
            disponibilidadeOcupada.setDataHoraInicio(dataAgendamento.getDataHora());
            disponibilidadeOcupada.setDataHoraFim(dataAgendamento.getDataHoraFim());
            return disponibilidadeRepository.save(disponibilidadeOcupada);
        }
        throw new DisponibilidadeException("Disponibilidade esta ocupada, tente outra data.");
    }
    @Transactional
    public void deletarDisponibilidade(Long id) {
        if(disponibilidadeRepository.existsById(id)) {
            disponibilidadeRepository.deleteById(id);
        }else{
            throw new DisponibilidadeException("Disponibilidade não encontrada, ja esta livre essa data");
        }
    }
}

