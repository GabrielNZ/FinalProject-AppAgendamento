package com.gabrielnz.agendamento.services;

import com.gabrielnz.agendamento.entities.Agendamento;
import com.gabrielnz.agendamento.entities.Status;
import com.gabrielnz.agendamento.entities.exceptions.AgendamentoException;
import com.gabrielnz.agendamento.entities.exceptions.ServicosException;
import com.gabrielnz.agendamento.entities.exceptions.UsuarioException;
import com.gabrielnz.agendamento.feignclient.ServicoFeingClient;
import com.gabrielnz.agendamento.feignclient.UsuarioFeingClient;
import com.gabrielnz.agendamento.feignclient.dtos.ServicoDTO;
import com.gabrielnz.agendamento.feignclient.dtos.Tipo;
import com.gabrielnz.agendamento.feignclient.dtos.UsuarioDTO;
import com.gabrielnz.agendamento.repositories.AgendamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AgendamentoServices {
    @Autowired
    private AgendamentoRepository agendamentoRepository;
    @Autowired
    UsuarioFeingClient usuarioFeingClient;
    @Autowired
    ServicoFeingClient servicoFeingClient;

    public Agendamento getAgendamentoPorId(Long id) {
        return agendamentoRepository.findById(id).orElseThrow(() -> new AgendamentoException("Agendamento não encontrado"));
    }
    public List<Agendamento> getTodosAgendamentos() {
        return agendamentoRepository.findAll();
    }
    @Transactional
    public Agendamento salvarAgendamento(Agendamento agendamento) {
        try {
            UsuarioDTO usuario = usuarioFeingClient.getPorId(agendamento.getCliente_id()).getBody();
            ServicoDTO servico = servicoFeingClient.getPorId(agendamento.getServico_id()).getBody();
            if(usuario.tipo() == Tipo.PRESTADOR) {
                throw new UsuarioException("O usuario precisa ser um Cliente");
            }
            agendamento.setStatus(Status.PENDENTE);
            // precisa validar dia e horario disponivel, porem a classe/projeto ainda nao foi criado
            //precisar configurar a mensagem rabbit avisando o prestador do agendamento, porem classe nao foi criada
            return agendamentoRepository.save(agendamento);
        }catch (UsuarioException e){
            throw new UsuarioException("Usuario nao econtrado");
        }catch (ServicosException e){
            throw new ServicosException("Servico nao econtrado");
        }
    }
    @Transactional
    public Agendamento updateAgendamento(Agendamento agendamento) {
        return agendamentoRepository.save(agendamento);
    }
    @Transactional
    public void deletarAgendamento(Long id) {
        if(agendamentoRepository.existsById(id)) {
            agendamentoRepository.deleteById(id);
        }else{
            throw new AgendamentoException("Agendamento não encontrado");
        }
    }
}
