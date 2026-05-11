const express = require('express')
const router = express.Router()
const autenticar = require('../middlewares/auth')
const { buscarUsuarios } = require('../controllers/usuarioController')
const db = require('../models/database')

router.get('/buscar', autenticar, buscarUsuarios)

router.put('/chave-publica', autenticar, (req, res) => {
    const { chave_publica } = req.body
    db.prepare('UPDATE usuarios SET chave_publica = ? WHERE id = ?').run(chave_publica, req.usuario.id)
    res.json({ mensagem: 'Chave pública salva' })
})

router.get('/:id/chave-publica', autenticar, (req, res) => {
    const usuario = db.prepare('SELECT chave_publica FROM usuarios WHERE id = ?').get(req.params.id)
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' })
    res.json({ chave_publica: usuario.chave_publica })
})

module.exports = router