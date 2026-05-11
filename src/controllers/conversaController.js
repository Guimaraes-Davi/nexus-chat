const db = require('../models/database')

const listarConversas = (req, res) => {
    const conversas = db.prepare(`
        SELECT c.id,
               c.tipo,
               CASE 
                   WHEN c.tipo = 'privada' THEN (
                       SELECT u.username FROM usuarios u
                       JOIN participantes p ON p.usuario_id = u.id
                       WHERE p.conversa_id = c.id AND u.id != ?
                   )
                   ELSE c.nome
               END as nome,
               CASE
                   WHEN c.tipo = 'privada' THEN (
                       SELECT u.id FROM usuarios u
                       JOIN participantes p ON p.usuario_id = u.id
                       WHERE p.conversa_id = c.id AND u.id != ?
                   )
                   ELSE NULL
               END as destinatario_id,
               (SELECT m.conteudo FROM mensagens m WHERE m.conversa_id = c.id ORDER BY m.criado_em DESC LIMIT 1) as ultima_mensagem
        FROM conversas c
        JOIN participantes p ON p.conversa_id = c.id
        WHERE p.usuario_id = ?
        ORDER BY (SELECT MAX(m.criado_em) FROM mensagens m WHERE m.conversa_id = c.id) DESC
    `).all(req.usuario.id, req.usuario.id, req.usuario.id)

    res.json(conversas)
}

const criarConversa = (req, res) => {
    const { usuario_id } = req.body

    const existente = db.prepare(`
        SELECT c.id FROM conversas c
        JOIN participantes p1 ON p1.conversa_id = c.id AND p1.usuario_id = ?
        JOIN participantes p2 ON p2.conversa_id = c.id AND p2.usuario_id = ?
        WHERE c.tipo = 'privada'
    `).get(req.usuario.id, usuario_id)

    if (existente) return res.json(existente)

    const conversa = db.prepare(`INSERT INTO conversas (tipo) VALUES ('privada')`).run()
    db.prepare(`INSERT INTO participantes (conversa_id, usuario_id) VALUES (?, ?)`).run(conversa.lastInsertRowid, req.usuario.id)
    db.prepare(`INSERT INTO participantes (conversa_id, usuario_id) VALUES (?, ?)`).run(conversa.lastInsertRowid, usuario_id)

    res.status(201).json({ id: conversa.lastInsertRowid })
}

const listarMensagens = (req, res) => {
    const { id } = req.params

    const participante = db.prepare(`
        SELECT * FROM participantes WHERE conversa_id = ? AND usuario_id = ?
    `).get(id, req.usuario.id)

    if (!participante) return res.status(403).json({ erro: 'Acesso negado' })

    const mensagens = db.prepare(`
        SELECT m.*, u.username FROM mensagens m
        JOIN usuarios u ON u.id = m.remetente_id
        WHERE m.conversa_id = ?
        ORDER BY m.criado_em ASC
    `).all(id)

    res.json(mensagens.map(m => ({
        ...m,
        lida_por: JSON.parse(m.lida_por || '[]')
    })))
}

const criarGrupo = (req, res) => {
    const { nome, usuarios_ids } = req.body

    if (!nome || !usuarios_ids || usuarios_ids.length < 1) {
        return res.status(400).json({ erro: 'Nome e pelo menos 1 participante são obrigatórios' })
    }

    const conversa = db.prepare(`INSERT INTO conversas (tipo, nome) VALUES ('grupo', ?)`).run(nome)
    const id = conversa.lastInsertRowid

    db.prepare(`INSERT INTO participantes (conversa_id, usuario_id) VALUES (?, ?)`).run(id, req.usuario.id)

    const outrosUsuarios = usuarios_ids.filter(uid => uid !== req.usuario.id)
    outrosUsuarios.forEach(uid => {
        db.prepare(`INSERT INTO participantes (conversa_id, usuario_id) VALUES (?, ?)`).run(id, uid)
    })

    res.status(201).json({ id, nome })
}

module.exports = { listarConversas, criarConversa, criarGrupo, listarMensagens }