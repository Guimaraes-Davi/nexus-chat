const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, '../../database.db'))

db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        chave_publica TEXT DEFAULT NULL,
        avatar TEXT DEFAULT NULL,
        online INTEGER DEFAULT 0,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conversas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL DEFAULT 'privada',
        nome TEXT DEFAULT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS participantes (
        conversa_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
        PRIMARY KEY (conversa_id, usuario_id),
        FOREIGN KEY (conversa_id) REFERENCES conversas(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS mensagens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversa_id INTEGER NOT NULL,
        remetente_id INTEGER NOT NULL,
        conteudo TEXT,
        arquivo TEXT DEFAULT NULL,
        arquivo_tipo TEXT DEFAULT NULL,
        arquivo_nome TEXT DEFAULT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversa_id) REFERENCES conversas(id),
        FOREIGN KEY (remetente_id) REFERENCES usuarios(id)
    );
`)

module.exports = db