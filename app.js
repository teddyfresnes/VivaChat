let pc
let dataChannel
let messages = document.getElementById('messages')
let sendBtn = document.getElementById('sendBtn')
let messageBox = document.getElementById('messageBox')
let createLinkBtn = document.getElementById('createLink')
let linkOutput = document.getElementById('linkOutput')
let linkInput = document.getElementById('linkInput')
let openLinkBtn = document.getElementById('openLink')
let configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }

init()

function init() {
  if (location.hash) {
    let data = decode(location.hash.substring(1))
    if (data.type === 'offer') {
      createPeer()
      pc.setRemoteDescription(new RTCSessionDescription(data.desc))
        .then(() => pc.createAnswer())
        .then(a => pc.setLocalDescription(a))
        .then(() => {
          let answerDesc = { type: 'answer', desc: pc.localDescription }
          location.hash = '#' + encode(answerDesc)
        })
    } else if (data.type === 'answer') {
      if (pc) {
        pc.setRemoteDescription(new RTCSessionDescription(data.desc))
      } else {
        createPeer()
        pc.setRemoteDescription(new RTCSessionDescription(data.desc))
      }
    }
  }
}

createLinkBtn.onclick = () => {
  createPeer()
  pc.createOffer().then(o => {
    pc.setLocalDescription(o).then(() => {
      let offerDesc = { type: 'offer', desc: pc.localDescription }
      let url = location.origin + location.pathname + '#' + encode(offerDesc)
      linkOutput.value = url
    })
  })
}

openLinkBtn.onclick = () => {
  location.href = linkInput.value
}

sendBtn.onclick = () => {
  let text = messageBox.value
  if (dataChannel && dataChannel.readyState === 'open') {
    dataChannel.send(text)
    addMessage('Toi: ' + text)
  }
  messageBox.value = ''
}

function createPeer() {
  pc = new RTCPeerConnection(configuration)
  pc.ondatachannel = e => {
    dataChannel = e.channel
    dataChannel.onmessage = ev => addMessage('Lui: ' + ev.data)
  }
  pc.onicecandidate = e => {
    if (!e.candidate && pc.localDescription) {
      let d = { type: pc.localDescription.type, desc: pc.localDescription }
      location.hash = '#' + encode(d)
    }
  }
  dataChannel = pc.createDataChannel('chat')
  dataChannel.onmessage = ev => addMessage('Lui: ' + ev.data)
}

function addMessage(msg) {
  let div = document.createElement('div')
  div.className = 'message-line'
  div.textContent = msg
  messages.appendChild(div)
  messages.scrollTop = messages.scrollHeight
}

function encode(obj) {
  return btoa(JSON.stringify(obj))
}

function decode(str) {
  return JSON.parse(atob(str))
}
