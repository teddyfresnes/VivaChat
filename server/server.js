const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()

const allowedOrigins = ['http://vivachat.ct.ws', 'http://localhost:3000', 'http://127.0.0.1:3000', 'null']

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true)
    } else {
      return callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
})

let users = {}

io.on('connection', socket => {
  socket.on('setUsername', username => {
    if (!users[socket.id]) users[socket.id] = { id: socket.id }
    users[socket.id].username = username
    io.emit('onlineUsers', Object.values(users))
  })

  socket.on('setAvatar', avatar => {
    if (!users[socket.id]) users[socket.id] = { id: socket.id }
    users[socket.id].avatar = avatar
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

server.listen(22453, () => {
  console.log("listening on 22453")
})
