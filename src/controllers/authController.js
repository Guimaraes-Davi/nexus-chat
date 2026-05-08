const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../models/database')

const registrar = (req, res) => {
    const { username, senha } = req.body

    if (!username || !senha) {
        return res.status(400).json({ erro: 'Username e senha são obrigatórios' })
    }

    if (username.length < 3) {
        return res.status(400).json({ erro: 'Username deve ter pelo menos 3 caracteres' })
    }

    if (senha.length < 6) {
        return res.status(400).json({ erro: 'Senha deve ter pelo menos 6 caracteres' })
    }

    const senhaHash = bcrypt.hashSync(senha, 10)

    try {
        const stmt = db.prepare('INSERT INTO usuarios (username, senha) VALUES (?, ?)')
        const resultado = stmt.run(username, senhaHash)
        
        const token = jwt.sign(
            { id: resultado.lastInsertRowid, username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.status(201).json({ token, username, id: resultado.lastInsertRowid })
    } catch (erro) {
        res.status(409).json({ erro: 'Username já está em uso' })
    }
}

const login = (req, res) => {
    const { username, senha } = req.body

    const usuario = db.prepare('SELECT * FROM usuarios WHERE username = ?').get(username)

    if (!usuario || !bcrypt.compareSync(senha, usuario.senha)) {
        return res.status(401).json({ erro: 'Credenciais inválidas' })
    }

    const token = jwt.sign(
        { id: usuario.id, username: usuario.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )

    res.json({ token, username: usuario.username, id: usuario.id })
}

module.exports = { registrar, login }