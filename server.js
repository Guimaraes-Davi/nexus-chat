const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const dotenv = require('dotenv')
const path = require('path')
const jwt = require('jsonwebtoken')

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.get('/nacl.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/tweetnacl/nacl-fast.js'))
})

app.get('/nacl-util.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/tweetnacl-util/nacl-util.js'))
})

const authRoutes = require('./src/routes/authRoutes')
const conversaRoutes = require('./src/routes/conversaRoutes')
const usuarioRoutes = require('./src/routes/usuarioRoutes')
const db = require('./src/models/database')

app.use('/auth', authRoutes)
app.use('/conversas', conversaRoutes)
app.use('/usuarios', usuarioRoutes)

const usuariosSockets = {}

io.use((socket, next) => {
    const token = socket.handshake.auth.token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        socket.usuario = decoded
        next()
    } catch (e) {
        next(new Error('Token inválido'))
    }
})

io.on('connection', (socket) => {
    usuariosSockets[socket.usuario.id] = socket.id
    console.log(`${socket.usuario.username} conectado`)

    socket.on('entrar-conversa', (conversaId) => {
        socket.join(`conversa_${conversaId}`)
    })

    socket.on('mensagem', (dados) => {
        const { conversa_id, conteudo, arquivo, arquivo_nome, arquivo_tipo } = dados

        const participante = db.prepare(`
            SELECT * FROM participantes WHERE conversa_id = ? AND usuario_id = ?
        `).get(conversa_id, socket.usuario.id)

        if (!participante) return

        const resultado = db.prepare(`
            INSERT INTO mensagens (conversa_id, remetente_id, conteudo, arquivo, arquivo_nome, arquivo_tipo)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(conversa_id, socket.usuario.id, conteudo || null, arquivo || null, arquivo_nome || null, arquivo_tipo || null)

        const mensagem = {
            id: resultado.lastInsertRowid,
            conversa_id,
            remetente_id: socket.usuario.id,
            username: socket.usuario.username,
            conteudo: conteudo || null,
            arquivo: arquivo || null,
            arquivo_nome: arquivo_nome || null,
            arquivo_tipo: arquivo_tipo || null,
            criado_em: new Date().toISOString()
        }

        io.to(`conversa_${conversa_id}`).emit('nova-mensagem', mensagem)

        const participantes = db.prepare(`
            SELECT usuario_id FROM participantes WHERE conversa_id = ?
        `).all(conversa_id)

        participantes.forEach(p => {
            const socketId = usuariosSockets[p.usuario_id]
            if (socketId) io.to(socketId).emit('atualizar-conversas')
        })
    })

    socket.on('disconnect', () => {
        delete usuariosSockets[socket.usuario.id]
        console.log(`${socket.usuario.username} desconectado`)
    })

    socket.on('digitando', (dados) => {
        socket.to(`conversa_${dados.conversa_id}`).emit('usuario-digitando', {
            conversa_id: dados.conversa_id,
            usuario_id: socket.usuario.id,
            username: socket.usuario.username
        })
    })

    socket.on('parou-digitar', (dados) => {
        socket.to(`conversa_${dados.conversa_id}`).emit('usuario-parou', {
            conversa_id: dados.conversa_id
        })
    })

    socket.on('marcar-lida', (dados) => {
        const { mensagem_id, conversa_id } = dados
        
        const mensagem = db.prepare('SELECT lida_por FROM mensagens WHERE id = ?').get(mensagem_id)
        if (!mensagem) return

        const lidaPor = JSON.parse(mensagem.lida_por || '[]')
        if (!lidaPor.includes(socket.usuario.id)) {
            lidaPor.push(socket.usuario.id)
            db.prepare('UPDATE mensagens SET lida_por = ? WHERE id = ?').run(JSON.stringify(lidaPor), mensagem_id)
            
            io.to(`conversa_${conversa_id}`).emit('mensagem-lida', {
                mensagem_id,
                lida_por: lidaPor
            })
        }
    })

})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
    console.log(`Nexus Chat rodando na porta ${PORT}`)
})