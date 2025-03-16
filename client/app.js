const socket = io('http://localhost:3000')

let username = loadData('username') || randomUsername()
let currentReceiver = null
let currentUsers = []
let usernameMap = {}
let conversations = loadData('conversations') || {}
let unreadCounts = loadData('unreadCounts') || {}
let canEdit = true

const pinnedUsersList = document.getElementById('pinnedUsers')
const onlineUsersList = document.getElementById('onlineUsers')
const messagesDiv = document.getElementById('messages')
const messageBox = document.getElementById('messageBox')
const sendBtn = document.getElementById('sendBtn')
const editUsernameIcon = document.getElementById('editUsername')
let currentUsernameSpan = document.getElementById('currentUsername')
const flushProfileIcon = document.getElementById('flushProfile')
const clearConvosIcon = document.getElementById('clearConvos')

currentUsernameSpan.textContent = username
disableChatInput(true)

socket.emit('setUsername', username)

socket.on('onlineUsers', users => {
  currentUsers = users
  users.forEach(u => {
    usernameMap[u.id] = u.username
  })
  if (currentReceiver && !users.find(u => u.id === currentReceiver)) {
    const lastMsg = conversations[currentReceiver]?.[conversations[currentReceiver].length - 1]
    const disconnectedText = usernameMap[currentReceiver] + ' s\'est déconnecté(e).'
    if (!lastMsg || lastMsg.sender !== 'system' || lastMsg.text !== disconnectedText) {
      addSystemMessage(currentReceiver, disconnectedText)
    }
    disableChatInput(true)
  }
  updateLists()
})

socket.on('receiveMessage', data => {
  if (!conversations[data.from]) conversations[data.from] = []
  if (data.from !== currentReceiver) unreadCounts[data.from] = (unreadCounts[data.from] || 0) + 1
  addMessageToConversation(data.from, data.message, 'other')
  updateLists()
  saveData()
})

currentUsernameSpan.onclick = () => {
  if (canEdit) triggerEditUsername()
}
editUsernameIcon.onclick = () => {
  if (canEdit) triggerEditUsername()
}

flushProfileIcon.onclick = () => {
  username = randomUsername()
  socket.emit('setUsername', username)
  currentUsernameSpan.textContent = username
  canEdit = false
  if (document.getElementById('editUsername')) document.getElementById('editUsername').remove()
  saveData()
}

clearConvosIcon.onclick = () => {
  conversations = {}
  unreadCounts = {}
  currentReceiver = null
  messagesDiv.innerHTML = ''
  disableChatInput(true)
  updateLists()
  saveData()
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
  let newUsername = input.value.trim()
  if (newUsername && newUsername !== oldUsername) {
    username = newUsername
    socket.emit('setUsername', username)
    canEdit = false
    if (document.getElementById('editUsername')) {
      document.getElementById('editUsername').remove()
    }
    saveData()
  } else {
    newUsername = oldUsername
  }
  const span = document.createElement('span')
  span.id = 'currentUsername'
  span.textContent = newUsername
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
    messageBox.placeholder = 'Tape ton message'
  }
}

function setCurrentReceiver(userId) {
  currentReceiver = userId
  unreadCounts[userId] = 0
  disableChatInput(false)
  renderConversation(userId)
  updateLists()
  saveData()
}

function sendMessage() {
  const text = messageBox.value.trim()
  if (!text || !currentReceiver) return
  socket.emit('sendMessage', { to: currentReceiver, message: text })
  addMessageToConversation(currentReceiver, text, 'me')
  messageBox.value = ''
  saveData()
}

sendBtn.onclick = () => sendMessage()
messageBox.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage()
})

function addMessageToConversation(partnerId, text, sender) {
  const time = new Date()
  if (!conversations[partnerId]) conversations[partnerId] = []
  conversations[partnerId].push({ sender, text, time, animated: false })
  if (currentReceiver === partnerId) renderConversation(partnerId)
}

function addSystemMessage(partnerId, msg) {
  if (!conversations[partnerId]) conversations[partnerId] = []
  conversations[partnerId].push({ sender: 'system', text: msg, time: new Date(), animated: false })
  if (currentReceiver === partnerId) renderConversation(partnerId)
}

function renderConversation(partnerId) {
  messagesDiv.innerHTML = ''
  const partnerName = usernameMap[partnerId] || 'Inconnu'
  const infoDiv = document.createElement('div')
  infoDiv.className = 'conversation-info'
  infoDiv.innerHTML = `<i class="fa fa-info-circle"></i><span>Vous discutez maintenant avec ${partnerName}.</span>`
  messagesDiv.appendChild(infoDiv)
  let prevSender = null
  let block
  conversations[partnerId]?.forEach((msg, i) => {
    if (msg.sender === 'system') {
      const sys = document.createElement('div')
      sys.className = 'system-message'
      sys.innerHTML = `<i class="fa fa-info-circle"></i><span>${msg.text}</span>`
      messagesDiv.appendChild(sys)
      prevSender = 'system'
      return
    }
    const formattedTime = ("0" + new Date(msg.time).getHours()).slice(-2) + ":" + ("0" + new Date(msg.time).getMinutes()).slice(-2)
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
      uname.textContent = msg.sender === 'me' ? username : partnerName
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
      if (!msg.animated) {
        bubble.classList.add('fade-in')
        msg.animated = true
      }
      block.appendChild(bubble)
      messagesDiv.appendChild(block)
    } else {
      const bubble = document.createElement('div')
      bubble.className = 'message-bubble'
      bubble.textContent = msg.text
      if (!msg.animated) {
        bubble.classList.add('fade-in')
        msg.animated = true
      }
      block.appendChild(bubble)
    }
    prevSender = msg.sender
  })
  messagesDiv.scrollTop = messagesDiv.scrollHeight
}

function updateLists() {
  pinnedUsersList.innerHTML = ''
  onlineUsersList.innerHTML = ''
  const pinnedIds = Object.keys(conversations).filter(id => id !== socket.id)
  const pinnedCount = pinnedIds.length
  if (pinnedCount > 0) {
    document.querySelector('.pinned-header .title').textContent = ''
    document.querySelector('.pinned-header').style.display = 'block'
    pinnedUsersList.style.display = 'block'
  } else {
    document.querySelector('.pinned-header').style.display = 'none'
    pinnedUsersList.style.display = 'none'
  }
  pinnedIds.forEach(id => {
    createListItem(id, pinnedUsersList, true)
  })
  currentUsers.forEach(u => {
    if (u.id !== socket.id && !pinnedIds.includes(u.id)) {
      createListItem(u.id, onlineUsersList, false)
    }
  })
}

function createListItem(id, container, isPinned) {
  const li = document.createElement('li')
  li.dataset.id = id
  const name = usernameMap[id] || 'Inconnu'
  let statusHTML = ''
  if (isPinned) {
    if (currentUsers.find(u => u.id === id)) {
      statusHTML = `<div class="user-status online">En ligne</div>`
    } else {
      statusHTML = `<div class="user-status offline">Déconnecté(e)</div>`
    }
  }
  li.innerHTML = `
    <div class="user-item">
      <div class="user-avatar"><i class="fa fa-user"></i></div>
      <div class="user-info-box">
        <div class="user-name">${name}</div>
        ${isPinned ? statusHTML : ''}
      </div>
      <span class="notif" style="display:none;"></span>
    </div>
  `
  const itemDiv = li.querySelector('.user-item')
  if (id === currentReceiver) itemDiv.classList.add('selected')
  const notifSpan = itemDiv.querySelector('.notif')
  if (unreadCounts[id]) {
    notifSpan.dataset.count = unreadCounts[id]
    notifSpan.textContent = unreadCounts[id]
    notifSpan.style.display = 'flex'
  }
  li.addEventListener('mousedown', e => {
    if (e.button !== 0) return
    li._timeout = setTimeout(() => {
      if (isPinned) {
        delete conversations[id]
        delete unreadCounts[id]
        if (id === currentReceiver) {
          currentReceiver = null
          messagesDiv.innerHTML = ''
          disableChatInput(true)
        }
        updateLists()
        saveData()
      }
    }, 1000)
  })
  li.addEventListener('mouseup', () => clearTimeout(li._timeout))
  li.addEventListener('mouseleave', () => clearTimeout(li._timeout))
  li.addEventListener('click', e => {
    if (!li._timeout) return
    clearTimeout(li._timeout)
    li._timeout = null
    setCurrentReceiver(id)
  })
  container.appendChild(li)
}

function randomUsername() {
  return 'Stranger' + Math.floor(1000 + Math.random() * 9000)
}

function saveData() {
  localStorage.setItem('username', username)
  localStorage.setItem('conversations', JSON.stringify(conversations))
  localStorage.setItem('unreadCounts', JSON.stringify(unreadCounts))
}

function loadData(key) {
  const d = localStorage.getItem(key)
  if (d) {
    if (key === 'conversations' || key === 'unreadCounts') {
      return JSON.parse(d)
    }
    return d
  }
  return null
}
