const db = require('../models/database')

const buscarUsuarios = (req, res) => {
    const { q } = req.query

    const usuarios = db.prepare(`
        SELECT id, username FROM usuarios 
        WHERE username LIKE ? AND id != ?
        LIMIT 10
    `).all(`%${q}%`, req.usuario.id)

    res.json(usuarios)
}

module.exports = { buscarUsuarios }