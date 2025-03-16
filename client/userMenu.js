const mainAvatarPreview = document.getElementById('mainAvatarPreview')
const menuUsername = document.getElementById('menuUsername')
const customizeAvatarBtn = document.getElementById('customizeAvatarBtn')
const userInfo = document.querySelector('.sidebar-footer .user-info')
avatarMenu = document.getElementById('avatarMenu')
const faceShapeSelect = document.getElementById('faceShape')
const hairTypeSelect = document.getElementById('hairType')
const eyeTypeSelect = document.getElementById('eyeType')
const colorPalettes = document.querySelectorAll('.color-palette')

userInfo.addEventListener('click', e => {
  if (mainMenu.style.display === 'block') {
    mainMenu.style.display = 'none'
  } else {
    menuUsername.value = username
    mainAvatarPreview.innerHTML = generateAvatarSVG(avatar, 80)
    mainMenu.style.display = 'block'
  }
  e.stopPropagation()
})

document.body.addEventListener('click', e => {
  if (
    mainMenu.style.display === 'block' &&
    !mainMenu.contains(e.target) &&
    !avatarMenu.contains(e.target) &&
    e.target !== userInfo
  ) {
    username = menuUsername.value.trim() || username
    socket.emit('setUsername', username)
    currentUsernameSpan.textContent = username
    canEdit = false
    saveData()
    mainMenu.style.display = 'none'
  }
})

customizeAvatarBtn.addEventListener('click', e => {
  faceShapeSelect.value = avatar.faceShape
  hairTypeSelect.value = avatar.hairType
  eyeTypeSelect.value = avatar.eyeType
  colorPalettes.forEach(palette => createPaletteSwatches(palette))
  avatarMenu.style.display = 'block'
  e.stopPropagation()
})

faceShapeSelect.addEventListener('change', () => {
  avatar.faceShape = faceShapeSelect.value
  mainAvatarPreview.innerHTML = generateAvatarSVG(avatar, 80)
})

hairTypeSelect.addEventListener('change', () => {
  avatar.hairType = hairTypeSelect.value
  mainAvatarPreview.innerHTML = generateAvatarSVG(avatar, 80)
})

eyeTypeSelect.addEventListener('change', () => {
  avatar.eyeType = eyeTypeSelect.value
  mainAvatarPreview.innerHTML = generateAvatarSVG(avatar, 80)
})

function createPaletteSwatches(palette) {
  palette.innerHTML = ''
  let colors = ['#ffffff','#000000','#ff0000','#ffa500','#ffff00','#008000','#0000ff','#800080','#808080','#2f3136','#7289da']
  colors.forEach(c => {
    let sw = document.createElement('div')
    sw.className = 'color-swatch'
    sw.style.backgroundColor = c
    sw.addEventListener('click', () => {
      let target = palette.dataset.target
      avatar[target] = c
      mainAvatarPreview.innerHTML = generateAvatarSVG(avatar, 80)
    })
    palette.appendChild(sw)
  })
}

document.body.addEventListener('click', e => {
  if (
    avatarMenu.style.display === 'block' &&
    !avatarMenu.contains(e.target) &&
    !customizeAvatarBtn.contains(e.target) &&
    !mainMenu.contains(e.target)
  ) {
    socket.emit('setAvatar', avatar)
    updateFooterAvatar()
    saveData()
    avatarMenu.style.display = 'none'
  }
})
