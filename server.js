const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

const authRoutes = require('./src/routes/authRoutes')
app.use('/auth', authRoutes)

const PORT = process.env.PORT || 3000

io.on('connection', (socket) => {
    console.log(`Usuário conectado: ${socket.id}`)

    socket.on('disconnect', () => {
        console.log(`Usuário desconectado: ${socket.id}`)
    })
})

server.listen(PORT, () => {
    console.log(`Nexus Chat rodando na porta ${PORT}`)
})

module.exports = { io }