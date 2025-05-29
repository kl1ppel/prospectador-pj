# Prospect HUB - Backend API

Este é o servidor backend para o aplicativo Prospect HUB, implementando uma API REST com Node.js e MySQL.

## Requisitos

- Node.js (v14 ou superior)
- MySQL (v5.7 ou superior)
- npm ou yarn

## Configuração inicial

1. **Instalar dependências**

```bash
cd server
npm install
```

2. **Configurar o banco de dados**

Crie um banco de dados MySQL executando o script SQL fornecido:

```bash
mysql -u root -p < config/database.sql
```

3. **Configurar variáveis de ambiente**

Edite o arquivo `.env` com suas configurações:

```
# Configurações do Servidor
PORT=5000
NODE_ENV=development

# Configurações do JWT (JSON Web Token)
JWT_SECRET=sua_chave_secreta_aqui  # Altere para uma chave segura
JWT_EXPIRES_IN=7d

# Configurações do Banco de Dados MySQL
DB_HOST=localhost
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=prospectdb
DB_PORT=3306
```

## Iniciar o servidor

Para iniciar o servidor em modo de desenvolvimento com hot-reload:

```bash
npm run dev
```

Para iniciar o servidor em modo de produção:

```bash
npm start
```

## Endpoints da API

### Autenticação

- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/me` - Obter dados do usuário atual (protegido)
- `POST /api/auth/forgot-password` - Solicitar redefinição de senha
- `POST /api/auth/reset-password` - Redefinir senha com token

### Usuários

- `GET /api/users/profile` - Obter perfil do usuário (protegido)
- `PUT /api/users/profile` - Atualizar perfil do usuário (protegido)

### Mensagens

- `GET /api/messages` - Obter histórico de mensagens (protegido)
- `POST /api/messages` - Enviar nova mensagem (protegido)
- `GET /api/messages/:id` - Obter mensagem específica (protegido)
- `DELETE /api/messages/:id` - Excluir mensagem (protegido)
- `DELETE /api/messages` - Limpar histórico de mensagens (protegido)

### RD Station

- `GET /api/rdstation/config` - Obter configuração do RD Station (protegido)
- `POST /api/rdstation/config` - Salvar configuração do RD Station (protegido)
- `DELETE /api/rdstation/config` - Excluir configuração do RD Station (protegido)
- `POST /api/rdstation/contact` - Enviar contato para o RD Station (protegido)

## Segurança

- Todas as rotas protegidas requerem um token JWT válido
- Senhas são criptografadas antes de serem armazenadas no banco
- Os tokens são verificados em cada requisição protegida
