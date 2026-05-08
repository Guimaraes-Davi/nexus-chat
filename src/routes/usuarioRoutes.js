const express = require('express')
const router = express.Router()
const autenticar = require('../middlewares/auth')
const { buscarUsuarios } = require('../controllers/usuarioController')

router.get('/buscar', autenticar, buscarUsuarios)

module.exports = router