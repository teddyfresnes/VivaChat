const socket = io('http://176.165.38.138:22453')

let username = loadData('username') || randomUsername()
let avatar = loadData('avatar') || randomAvatar()
let currentReceiver = null
let currentUsers = []
let usernameMap = {}
let avatarMap = {}
let conversations = loadData('conversations') || {}
let unreadCounts = loadData('unreadCounts') || {}
let canEdit = true

const pinnedUsersList = document.getElementById('pinnedUsers')
const onlineUsersList = document.getElementById('onlineUsers')
const messagesDiv = document.getElementById('messages')
const messageBox = document.getElementById('messageBox')
const sendBtn = document.getElementById('sendBtn')
const flushProfileIcon = document.getElementById('flushProfile')
const clearConvosIcon = document.getElementById('clearConvos')
const currentUsernameSpan = document.getElementById('currentUsername')
const footerAvatar = document.querySelector('.footer-avatar')
const mainMenu = document.getElementById('mainMenu')
avatarMenu = document.getElementById('avatarMenu')

function updateFooterAvatar() {
  footerAvatar.innerHTML = generateAvatarSVG(avatar, 30)
}

updateFooterAvatar()
currentUsernameSpan.textContent = username
disableChatInput(true)
socket.emit('setUsername', username)
socket.emit('setAvatar', avatar)

socket.on('onlineUsers', users => {
  currentUsers = users
  users.forEach(u => {
    usernameMap[u.id] = u.username
    avatarMap[u.id] = u.avatar
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

flushProfileIcon.onclick = () => {
  username = randomUsername()
  avatar = randomAvatar()
  socket.emit('setUsername', username)
  socket.emit('setAvatar', avatar)
  currentUsernameSpan.textContent = username
  canEdit = false
  updateFooterAvatar()
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
  conversations[partnerId]?.forEach(msg => {
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
      const avatarDiv = document.createElement('div')
      avatarDiv.className = 'message-avatar'
      if (msg.sender === 'me') {
        avatarDiv.innerHTML = generateAvatarSVG(avatar, 55)
      } else {
        avatarDiv.innerHTML = generateAvatarSVG(avatarMap[partnerId], 55)
      }
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
      header.appendChild(avatarDiv)
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
      <div class="user-avatar">${generateAvatarSVG(avatarMap[id], 30)}</div>
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
  li.addEventListener('click', () => {
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

function randomAvatar() {
  return {
    backgroundColor: '#'+(Math.floor(Math.random()*16777215).toString(16)).padStart(6, '0'),
    faceShape: 'round',
    eyeType: 'normal',
    eyeColor: '#000000',
    hairType: 'short',
    hairColor: '#ffffff'
  }
}

function generateAvatarSVG(conf, size) {
  const bg = conf ? conf.backgroundColor : '#7289da'
  const face = conf ? conf.faceShape : 'round'
  const eye = conf ? conf.eyeType : 'normal'
  const eyeC = conf ? conf.eyeColor : '#000000'
  const hair = conf ? conf.hairType : 'short'
  const hairC = conf ? conf.hairColor : '#ffffff'
  const facePath = face === 'oval' ? `<ellipse cx="50" cy="50" rx="30" ry="40" fill="white"/>` : `<circle cx="50" cy="50" r="30" fill="white"/>`
  let eyePath = ''
  if (eye === 'normal') eyePath = `<circle cx="40" cy="45" r="3" fill="${eyeC}"/><circle cx="60" cy="45" r="3" fill="${eyeC}"/>`
  if (eye === 'happy') eyePath = `<path d="M37,45 Q40,42 43,45" stroke="${eyeC}" stroke-width="2" fill="none"/><path d="M57,45 Q60,42 63,45" stroke="${eyeC}" stroke-width="2" fill="none"/>`
  if (eye === 'wink') eyePath = `<circle cx="40" cy="45" r="3" fill="${eyeC}"/><path d="M57,45 Q60,42 63,45" stroke="${eyeC}" stroke-width="2" fill="none"/>`
  let hairPath = ''
  if (hair === 'short') hairPath = `<rect x="20" y="20" width="60" height="15" fill="${hairC}" rx="8" ry="8"/>`
  if (hair === 'long') hairPath = `<rect x="20" y="20" width="60" height="30" fill="${hairC}" rx="10" ry="10"/>`
  if (hair === 'mohawk') hairPath = `<rect x="45" y="10" width="10" height="25" fill="${hairC}" rx="4" ry="4"/>`
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
      <rect width="100" height="100" fill="${bg}"/>
      ${hairPath}
      ${facePath}
      ${eyePath}
    </svg>
  `
}

function saveData() {
  localStorage.setItem('username', username)
  localStorage.setItem('avatar', JSON.stringify(avatar))
  localStorage.setItem('conversations', JSON.stringify(conversations))
  localStorage.setItem('unreadCounts', JSON.stringify(unreadCounts))
}

function loadData(key) {
  const d = localStorage.getItem(key)
  if (d) {
    if (key === 'conversations' || key === 'unreadCounts' || key === 'avatar') {
      return JSON.parse(d)
    }
    return d
  }
  return null
}
