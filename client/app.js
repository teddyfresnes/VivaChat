const socket = io('http://localhost:3000')
let username = 'Stranger'
let currentReceiver = null
let userListItems = {}
const conversations = {}
let canEdit = true
const onlineUsersList = document.getElementById('onlineUsers')
const messagesDiv = document.getElementById('messages')
const messageBox = document.getElementById('messageBox')
const sendBtn = document.getElementById('sendBtn')
const editUsernameIcon = document.getElementById('editUsername')
let currentUsernameSpan = document.getElementById('currentUsername')
disableChatInput(true)
socket.emit('setUsername', username)
let currentUsers = []
socket.on('onlineUsers', users => {
  const prevCurrentReceiver = currentReceiver
  currentUsers = users
  onlineUsersList.innerHTML = ''
  userListItems = {}
  users.forEach(u => {
    if (u.id !== socket.id) {
      const li = document.createElement('li')
      li.dataset.id = u.id
      li.dataset.username = u.username || 'Stranger'
      li.innerHTML = `<div class="user-item">
                        <div class="user-avatar"><i class="fa fa-user"></i></div>
                        <div class="user-name">${li.dataset.username}</div>
                      </div>`
      li.onclick = () => {
        setCurrentReceiver(u.id)
        const notif = li.querySelector('.notif')
        if (notif) notif.remove()
      }
      onlineUsersList.appendChild(li)
      userListItems[u.id] = li
    }
  })
  if (prevCurrentReceiver && !users.find(u => u.id === prevCurrentReceiver)) {
    if (conversations[prevCurrentReceiver]) {
      addSystemMessage(prevCurrentReceiver, (userListItems[prevCurrentReceiver]?.dataset.username || 'Stranger') + ' s\'est déconnecté')
    }
    disableChatInput(true)
  }
})
currentUsernameSpan.onclick = () => {
  if (canEdit) triggerEditUsername()
}
editUsernameIcon.onclick = () => {
  if (canEdit) triggerEditUsername()
}
function triggerEditUsername() {
  const input = document.createElement('input')
  input.type = 'text'
  input.value = currentUsernameSpan.textContent
  input.className = 'username-input'
  currentUsernameSpan.replaceWith(input)
  input.focus()
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') updateUsername(input)
  })
  input.addEventListener('blur', () => updateUsername(input))
}
function updateUsername(input) {
  const oldUsername = currentUsernameSpan.textContent
  let newUsername = input.value.trim().slice(0,10)
  if (newUsername && newUsername !== oldUsername) {
    username = newUsername
    socket.emit('setUsername', username)
    canEdit = false
    if(document.getElementById('editUsername')) {
      document.getElementById('editUsername').remove()
    }
  } else {
    newUsername = oldUsername
  }
  const span = document.createElement('span')
  span.id = 'currentUsername'
  span.textContent = newUsername || 'Stranger'
  span.style.fontWeight = 'bold'
  input.replaceWith(span)
  currentUsernameSpan = span
}
function disableChatInput(disabled) {
  messageBox.disabled = disabled
  sendBtn.disabled = disabled
  if (disabled) {
    messageBox.placeholder = ''
    sendBtn.classList.add('disabled')
  } else {
    sendBtn.classList.remove('disabled')
  }
}
function setCurrentReceiver(userId) {
  currentReceiver = userId
  disableChatInput(false)
  messageBox.placeholder = 'Tape ton message'
  renderConversation(userId)
}
function sendMessage() {
  const text = messageBox.value.trim()
  if (!text || !currentReceiver) return
  socket.emit('sendMessage', { to: currentReceiver, message: text })
  addMessageToConversation(currentReceiver, text, 'me')
  messageBox.value = ''
}
sendBtn.onclick = () => sendMessage()
messageBox.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage()
})
socket.on('receiveMessage', data => {
  addMessageToConversation(data.from, data.message, 'other')
  if (userListItems[data.from]) {
    const li = userListItems[data.from]
    if (currentReceiver !== data.from) {
      let notif = li.querySelector('.notif')
      if (!notif) {
        notif = document.createElement('span')
        notif.className = 'notif'
        li.style.position = 'relative'
        li.appendChild(notif)
        notif.dataset.count = 0
      }
      let count = parseInt(notif.dataset.count) || 0
      count++
      notif.dataset.count = count
      notif.textContent = count
    }
    onlineUsersList.insertBefore(li, onlineUsersList.firstChild)
  }
})
function addMessageToConversation(partnerId, text, sender) {
  const time = new Date()
  if (!conversations[partnerId]) {
    conversations[partnerId] = []
  }
  conversations[partnerId].push({ sender, text, time })
  if (currentReceiver === partnerId) {
    renderConversation(partnerId)
  }
}
function addSystemMessage(partnerId, msg) {
  if (!conversations[partnerId]) {
    conversations[partnerId] = []
  }
  conversations[partnerId].push({ sender: 'system', text: msg, time: new Date() })
  if (currentReceiver === partnerId) {
    renderConversation(partnerId)
  }
}
function renderConversation(partnerId) {
  messagesDiv.innerHTML = ''
  if (userListItems[partnerId]) {
    const partnerUsername = userListItems[partnerId].dataset.username
    const infoDiv = document.createElement('div')
    infoDiv.className = 'conversation-info'
    infoDiv.textContent = "Vous discutez avec " + partnerUsername
    messagesDiv.appendChild(infoDiv)
  }
  let prevSender = null
  let block
  conversations[partnerId]?.forEach(msg => {
    if (msg.sender === 'system') {
      const sys = document.createElement('div')
      sys.className = 'system-message'
      sys.textContent = msg.text
      messagesDiv.appendChild(sys)
      prevSender = 'system'
      return
    }
    const formattedTime = ("0" + msg.time.getHours()).slice(-2) + ":" + ("0" + msg.time.getMinutes()).slice(-2)
    if (msg.sender !== prevSender || prevSender === 'system') {
      block = document.createElement('div')
      block.className = 'message-block ' + (msg.sender === 'me' ? 'msg-me' : 'msg-other')
      const header = document.createElement('div')
      header.className = 'message-header'
      const avatar = document.createElement('div')
      avatar.className = 'message-avatar'
      avatar.innerHTML = '<i class="fa fa-user"></i>'
      const meta = document.createElement('div')
      meta.className = 'message-meta'
      const uname = document.createElement('span')
      uname.className = 'message-username'
      uname.textContent = msg.sender === 'me' ? username : userListItems[msg.sender]?.dataset.username || 'Stranger'
      const timeSpan = document.createElement('span')
      timeSpan.className = 'message-time'
      timeSpan.textContent = formattedTime
      meta.appendChild(uname)
      meta.appendChild(timeSpan)
      header.appendChild(avatar)
      header.appendChild(meta)
      block.appendChild(header)
      const bubble = document.createElement('div')
      bubble.className = 'message-bubble'
      bubble.textContent = msg.text
      block.appendChild(bubble)
      messagesDiv.appendChild(block)
    } else {
      const bubble = document.createElement('div')
      bubble.className = 'message-bubble'
      bubble.textContent = msg.text
      block.appendChild(bubble)
    }
    prevSender = msg.sender
  })
  messagesDiv.scrollTop = messagesDiv.scrollHeight
}
