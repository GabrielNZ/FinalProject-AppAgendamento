package com.gabrielnz.agendamento.services;

import com.gabrielnz.agendamento.entities.Agendamento;
import com.gabrielnz.agendamento.entities.Status;
import com.gabrielnz.agendamento.entities.exceptions.AgendamentoException;
import com.gabrielnz.agendamento.entities.exceptions.ServicosException;
import com.gabrielnz.agendamento.entities.exceptions.UsuarioException;
import com.gabrielnz.agendamento.feignclient.DisponibilidadeOcupadaFeingClient;
import com.gabrielnz.agendamento.feignclient.ServicoFeingClient;
import com.gabrielnz.agendamento.feignclient.UsuarioFeingClient;
import com.gabrielnz.agendamento.feignclient.dtos.AgendamentoDataDTO;
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
    @Autowired
    DisponibilidadeOcupadaFeingClient disponibilidadeOcupadaFeingClient;

    public Agendamento getAgendamentoPorId(Long id) {
        return agendamentoRepository.findById(id).orElseThrow(() -> new AgendamentoException("Agendamento não encontrado"));
    }
    public List<Agendamento> getTodosAgendamentos() {
        return agendamentoRepository.findAll();
    }
    @Transactional
    public Agendamento salvarAgendamento(Agendamento agendamento) {
        try {
            UsuarioDTO usuario = usuarioFeingClient.getPorId(agendamento.getClienteId()).getBody();
            ServicoDTO servico = servicoFeingClient.getPorId(agendamento.getServicoId()).getBody();
            if(usuario.tipo() == Tipo.PRESTADOR) {
                throw new UsuarioException("O usuario precisa ser um Cliente");
            }
            AgendamentoDataDTO agendamentoInfo = new AgendamentoDataDTO();
            agendamentoInfo.setDataHora(agendamento.getDataHora());
            agendamentoInfo.setDataHoraFim(agendamento.getDataHora().plusMinutes(servico.duracaoMinutos()));
            agendamentoInfo.setPrestadorId(agendamento.getPrestadorId());
           if(!disponibilidadeOcupadaFeingClient.estaDisponivel(agendamentoInfo).getBody()){
                throw new AgendamentoException("Disponibilidade ocupada, tente outra data/horario");
            }
            agendamento.setStatus(Status.PENDENTE);
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
        AgendamentoDataDTO agendamentoInfo = agendamentoParaDTO(agendamento);
        if (agendamento.getStatus() == Status.CONCLUIDO) {
            throw new AgendamentoException("Esse agendamento ja foi concluido...");
        } else if (agendamento.getStatus() == Status.AGENDADO) {
            if (disponibilidadeOcupadaFeingClient.estaDisponivel(agendamentoInfo).getBody()) {
                agendamento.setStatus(Status.PENDENTE);
                disponibilidadeOcupadaFeingClient.deletarDisponibilidade(agendamento.getDisponibilidadeOcupadaId());
                agendamento.setDisponibilidadeOcupadaId(null);
                //precisar configurar a mensagem rabbit avisando o prestador da mudanca, porem classe nao foi criada
                return agendamentoRepository.save(agendamento);
            } else {
                throw new AgendamentoException("Nada foi alterado, a data nova ja esta sendo ocupada por outro agendamento.");
            }
        } else if (agendamento.getStatus() == Status.PENDENTE) {
            if (disponibilidadeOcupadaFeingClient.estaDisponivel(agendamentoInfo).getBody()) {
                //precisar configurar a mensagem rabbit avisando o prestador da mudanca, porem classe nao foi criada
                return agendamentoRepository.save(agendamento);
            } else {
                throw new AgendamentoException("Nada foi alterado, a data nova ja esta sendo ocupada por outro agendamento.");
            }
        } else if(agendamento.getStatus() == Status.CANCELADO) {
            throw new AgendamentoException("Nada foi alterado, o agendamento ja esta cancelado.");
        } else {
            throw new AgendamentoException("Nada foi alterado, este agendamento foi recusado. Crie um novo agendamento.");
        }
    }
    @Transactional
    public void deletarCancelarAgendamento(Long id) {
        if(agendamentoRepository.existsById(id)) {
            Agendamento agendamento = agendamentoRepository.getById(id);
            if(agendamento.getStatus() == Status.PENDENTE) {
                agendamentoRepository.deleteById(id);
            } else if(agendamento.getStatus() == Status.AGENDADO) {
                disponibilidadeOcupadaFeingClient.deletarDisponibilidade(agendamento.getDisponibilidadeOcupadaId());
                agendamento.setDisponibilidadeOcupadaId(null);
                agendamento.setStatus(Status.CANCELADO);
                agendamentoRepository.save(agendamento);
            }
        }else{
            throw new AgendamentoException("Agendamento não encontrado ou nao pode ser deletado");
        }
    }
    // colocar Security para garantir que quem chama o metodo é o prestador do servido do agendamento
    public Agendamento aprovarAgendamento(Long id) {
        Agendamento agendamento = getAgendamentoPorId(id);
        AgendamentoDataDTO agentamentoInfo = agendamentoParaDTO(agendamento);
        if(agendamento.getStatus() == Status.PENDENTE) {
            if(disponibilidadeOcupadaFeingClient.estaDisponivel(agentamentoInfo).getBody()){
                agendamento.setStatus(Status.AGENDADO);
                agendamento.setDisponibilidadeOcupadaId(disponibilidadeOcupadaFeingClient.salvarDisponibilidade(agentamentoInfo).getBody().id());
                agendamentoRepository.save(agendamento);
                //notificar o cliente com RabbitMQ e mensageria, porem o projeto ainda nao foi criado
                return agendamentoRepository.save(agendamento);
            } else {
                throw new AgendamentoException("Disponibilidade ocupada, a data desse agendamento esta sendo ocupada por outro ja aprovado");
            }
        }else if(agendamento.getStatus() == Status.AGENDADO) {
            throw new AgendamentoException("O agendamento ja foi agendado");
        }else if(agendamento.getStatus() == Status.CONCLUIDO) {
            throw new AgendamentoException("O agendamento ja foi concluido");
        }else {
            throw new AgendamentoException("Impossivel aprovar agendamento, o mesmo ja foi cancelado");
        }
    }
    // colocar Security para garantir que quem chama o metodo é o prestador do servido do agendamento
    public Agendamento recusarCancelarAgendamento(Long id) {
        Agendamento agendamento = getAgendamentoPorId(id);
        AgendamentoDataDTO agendamentoInfo = agendamentoParaDTO(agendamento);
        if(agendamento.getStatus() == Status.PENDENTE) {
            agendamento.setStatus(Status.RECUSADO);
            //notificar o cliente com RabbitMQ e mensageria, porem o projeto ainda nao foi criado
            return agendamentoRepository.save(agendamento);
        }else if(agendamento.getStatus() == Status.AGENDADO) {
            agendamento.setStatus(Status.CANCELADO);
            disponibilidadeOcupadaFeingClient.deletarDisponibilidade(agendamento.getDisponibilidadeOcupadaId());
            //notificar o cliente com RabbitMQ e mensageria, porem o projeto ainda nao foi criado
            return agendamentoRepository.save(agendamento);
        }else if(agendamento.getStatus() == Status.CONCLUIDO) {
            throw new AgendamentoException("O agendamento ja foi concluido");
        }else {
            throw new AgendamentoException("O agendamento ja foi cancelado");
        }
    }
    public AgendamentoDataDTO agendamentoParaDTO(Agendamento agendamento) {
        ServicoDTO servico = servicoFeingClient.getPorId(agendamento.getServicoId()).getBody();
        AgendamentoDataDTO agendamentoInfo = new AgendamentoDataDTO();
        agendamentoInfo.setDataHora(agendamento.getDataHora());
        agendamentoInfo.setDataHoraFim(agendamento.getDataHora().plusMinutes(servico.duracaoMinutos()));
        agendamentoInfo.setPrestadorId(agendamento.getPrestadorId());
        return agendamentoInfo;
    }
}
