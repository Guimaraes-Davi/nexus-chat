const express = require('express')
const router = express.Router()
const autenticar = require('../middlewares/auth')
const { listarConversas, criarConversa, criarGrupo, listarMensagens } = require('../controllers/conversaController')

router.post('/grupo', autenticar, criarGrupo)
router.get('/', autenticar, listarConversas)
router.post('/', autenticar, criarConversa)
router.get('/:id/mensagens', autenticar, listarMensagens)

module.exports = router