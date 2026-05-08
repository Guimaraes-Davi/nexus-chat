const express = require('express')
const router = express.Router()
const autenticar = require('../middlewares/auth')
const { listarConversas, criarConversa, criarGrupo, listarMensagens } = require('../controllers/conversaController')

router.post('/grupo', autenticar, criarGrupo)
router.get('/', autenticar, listarConversas)
router.post('/', autenticar, criarConversa)
router.get('/:id/mensagens', autenticar, listarMensagens)

module.exports = router

const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname))
})

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const permitidos = /jpeg|jpg|png|gif|mp4|mov|pdf|txt|zip/
        const ext = permitidos.test(path.extname(file.originalname).toLowerCase())
        if (ext) cb(null, true)
        else cb(new Error('Tipo não permitido'))
    }
})

router.post('/:id/upload', autenticar, upload.single('arquivo'), (req, res) => {
    if (!req.file) return res.status(400).json({ erro: 'Nenhum arquivo enviado' })
    res.json({
        arquivo: req.file.filename,
        arquivo_nome: req.file.originalname,
        arquivo_tipo: req.file.mimetype
    })
})