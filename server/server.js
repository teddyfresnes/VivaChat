const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
app.use(cors())

const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

let users = {}

io.on('connection', socket => {
  socket.on('setUsername', username => {
    users[socket.id] = { username, id: socket.id }
    io.emit('onlineUsers', Object.values(users))
  })

  socket.on('sendMessage', data => {
    if (users[data.to]) {
      io.to(data.to).emit('receiveMessage', {
        from: socket.id,
        message: data.message
      })
    }
  })

  socket.on('disconnect', () => {
    delete users[socket.id]
    io.emit('onlineUsers', Object.values(users))
  })
})

server.listen(3000, () => {
  console.log('Server listening on port 3000')
})
