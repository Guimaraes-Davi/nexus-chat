# Nexus Chat — Contexto para Claude Code

## O que é
Chat em tempo real com criptografia ponta a ponta em conversas privadas.
Stack: Node.js, Express, Socket.io, TweetNaCl, JWT, bcryptjs, better-sqlite3, multer.

## Arquitetura
nexus-chat/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── conversaController.js
│   │   └── usuarioController.js
│   ├── middlewares/auth.js
│   ├── models/database.js
│   └── routes/
│       ├── authRoutes.js
│       ├── conversaRoutes.js
│       └── usuarioRoutes.js
├── public/
│   ├── uploads/
│   ├── index.html      ← toda a lógica frontend está aqui
│   └── style.css
├── server.js           ← Express + Socket.io + JWT middleware
└── .env

## Banco de dados (SQLite)
- usuarios (id, username, senha, chave_publica, avatar, online, criado_em)
- conversas (id, tipo, nome, criado_em)
- participantes (conversa_id, usuario_id)
- mensagens (id, conversa_id, remetente_id, conteudo, arquivo, arquivo_tipo, arquivo_nome, lida_por, criado_em)
- lida_por é um array JSON de IDs: '[]', '[1]', '[1,2]'

## Criptografia E2E (TweetNaCl)
- Chaves geradas no browser com nacl.box.keyPair()
- Chave privada: localStorage ('chavePrivada')
- Chave pública: salva no servidor via PUT /usuarios/chave-publica
- Mensagem criptografada duas vezes: para_destinatario e para_remetente
- Grupos NÃO têm E2E — apenas conversas privadas
- nacl.js e nacl-util.js servidos pelo Express a partir de node_modules

## Fluxo de chaves
1. Registro/Login → verificar se chavePrivada existe no localStorage
2. Se não existir → gerar novo par, salvar privada no localStorage, PUT chave pública no servidor
3. Se existir → PUT chave pública derivada da privada no servidor (garante sincronia após reinício)

## Socket.io events
- entrar-conversa → join room
- mensagem → envia com conteudo + arquivo opcional
- nova-mensagem → broadcast para room
- atualizar-conversas → notifica sidebar
- digitando / parou-digitar → indicador de digitando
- marcar-lida / mensagem-lida → confirmação de leitura ✓✓

## Bugs conhecidos e pendentes
- lida_por não persiste corretamente ao recarregar histórico (✓✓ vira ✓)
- Chave privada some do localStorage após reinício do Render

## Padrões
- Código e comentários em português
- Nunca salvar XMLs ou dados sensíveis
- Arquivos em public/uploads são efêmeros no Render gratuito