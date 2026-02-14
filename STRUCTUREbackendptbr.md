# Estrutura do Projeto

### Autenticação:
- Login ocorre via /auth/login
- O backend:
  - Valida email e senha
  - Gera um JWT
  - Retorna o token no header Authorization
  - O frontend salva esse token (ex: localStorage)
  - Todas as próximas requisições enviam esse token no header
  
### Usuários:
- Prestador:
  - Cria serviços
  - Define horários disponíveis
  - Visualiza e gerencia seus agendamentos
- Cliente:
  - Visualiza serviços
  - Agenda horários
  - Gerencia seus próprios agendamentos

### Agendamento:
- Cliente:
  - Escolhe um serviço
  - Escolhe uma data e horário disponíveis
  - Envia o pedido de agendamento
    - -> Email do prestador
    - -> Dashboard do prestador 
- Sistema:
  - Valida o token do usuário
  - Cria o agendamento como PENDENTE
  - Ainda não bloqueia definitivamente o horário ( Outros clientes podem solicitar esse horario )
- Prestador:
  - Aprova ou Rejeita o agendamento
    - Aprovado: Horario bloqueado. ( Nenhum agendamento pode ser feito nesse horario, a menos que o Prestador o cancele liberando novamente o horario. )
    - Rejeitado: Sistema registra como rejeitado e o agendamento e descartado
- Obs:  Entre as 24h depois da data do agendamento, o prestador pode marcar que o cliente faltou, após as 24h a opção e desabilitada ( Sistema considera presença do cliente )

### Gateway:
- É o único ponto de acesso do frontend
- Recebe todas as requisições HTTP
- Faz:
  - CORS
  - Validação do JWT
  - Bloqueia requisições sem token
  - Se o token for válido:
  - Extrai dados do usuário (email, tipo)
  - Encaminha a requisição para o microsserviço correto
