let localConnection
let remoteConnection
let dataChannel
let remoteChannel

let messages = document.getElementById('messages')
let sendBtn = document.getElementById('sendBtn')
let messageBox = document.getElementById('messageBox')
let createOfferBtn = document.getElementById('createOffer')
let acceptOfferBtn = document.getElementById('acceptOffer')
let createAnswerBtn = document.getElementById('createAnswer')
let acceptAnswerBtn = document.getElementById('acceptAnswer')
let offerInput = document.getElementById('offerInput')
let answerInput = document.getElementById('answerInput')

let configuration = { iceServers: [{ urls: 'stun:stun1.l.google.com:19302' }] }

createOfferBtn.onclick = () => {
  localConnection = new RTCPeerConnection(configuration)
  dataChannel = localConnection.createDataChannel('chatChannel')
  dataChannel.onopen = () => {}
  dataChannel.onmessage = e => addMessage('Lui: ' + e.data)
  localConnection.onicecandidate = e => {
    if (e.candidate) return
    offerInput.value = JSON.stringify(localConnection.localDescription)
  }
  localConnection.createOffer().then(o => {
    localConnection.setLocalDescription(o)
  })
}

acceptOfferBtn.onclick = () => {
  remoteConnection = new RTCPeerConnection(configuration)
  remoteConnection.ondatachannel = e => {
    remoteChannel = e.channel
    remoteChannel.onmessage = ev => addMessage('Lui: ' + ev.data)
    remoteChannel.onopen = () => {}
  }
  remoteConnection.onicecandidate = e => {
    if (e.candidate) return
    answerInput.value = JSON.stringify(remoteConnection.localDescription)
  }
  let offer = JSON.parse(offerInput.value)
  remoteConnection.setRemoteDescription(offer).then(() => {
    remoteConnection.createAnswer().then(a => {
      remoteConnection.setLocalDescription(a)
    })
  })
}

createAnswerBtn.onclick = () => {
  localConnection = new RTCPeerConnection(configuration)
  localConnection.ondatachannel = e => {
    remoteChannel = e.channel
    remoteChannel.onmessage = ev => addMessage('Lui: ' + ev.data)
    remoteChannel.onopen = () => {}
  }
  localConnection.onicecandidate = e => {
    if (e.candidate) return
    answerInput.value = JSON.stringify(localConnection.localDescription)
  }
  let offer = JSON.parse(offerInput.value)
  localConnection.setRemoteDescription(offer).then(() => {
    localConnection.createAnswer().then(a => {
      localConnection.setLocalDescription(a)
    })
  })
}

acceptAnswerBtn.onclick = () => {
  let answer = JSON.parse(answerInput.value)
  if (remoteConnection) {
    remoteConnection.setRemoteDescription(answer)
  } else {
    localConnection.setRemoteDescription(answer)
  }
}

sendBtn.onclick = () => {
  let text = messageBox.value
  if (dataChannel && dataChannel.readyState === 'open') {
    dataChannel.send(text)
  }
  if (remoteChannel && remoteChannel.readyState === 'open') {
    remoteChannel.send(text)
  }
  addMessage('Toi: ' + text)
  messageBox.value = ''
}

function addMessage(msg) {
  let div = document.createElement('div')
  div.className = 'message-line'
  div.textContent = msg
  messages.appendChild(div)
  messages.scrollTop = messages.scrollHeight
}
