# Nexus Chat

Chat seguro com criptografia ponta a ponta entre usuários.

## Acesse online
https://nexus-chat.onrender.com

## Funcionalidades
- Autenticação JWT com bcrypt
- Mensagens em tempo real via WebSockets
- Criptografia ponta a ponta (conversas privadas) com TweetNaCl
- Grupos de conversa
- Upload de fotos, vídeos e arquivos
- Indicador de digitando
- Confirmação de leitura ✓✓

## Tecnologias
- Node.js, Express, Socket.io
- SQLite (better-sqlite3)
- JWT, bcryptjs, TweetNaCl
- multer

## Observações técnicas
- Criptografia E2E apenas em conversas privadas
- Uploads são efêmeros no plano gratuito do Render
- Em produção real: PostgreSQL + AWS S3

## Autor
Davi Guimarães