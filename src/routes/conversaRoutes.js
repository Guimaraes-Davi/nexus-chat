const express = require('express')
const router = express.Router()
const autenticar = require('../middlewares/auth')
const { listarConversas, criarConversa, listarMensagens } = require('../controllers/conversaController')

router.get('/', autenticar, listarConversas)
router.post('/', autenticar, criarConversa)
router.get('/:id/mensagens', autenticar, listarMensagens)

module.exports = router