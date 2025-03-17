const mainAvatarPreview = document.getElementById('mainAvatarPreview')
const menuUsername = document.getElementById('menuUsername')
const customizeAvatarBtn = document.getElementById('customizeAvatarBtn')
const userInfo = document.querySelector('.sidebar-footer .user-info')
avatarMenu = document.getElementById('avatarMenu')
const faceShapeLeft = document.getElementById('faceShapeLeft')
const faceShapeRight = document.getElementById('faceShapeRight')
const faceShapeValue = document.getElementById('faceShapeValue')
const hairTypeLeft = document.getElementById('hairTypeLeft')
const hairTypeRight = document.getElementById('hairTypeRight')
const hairTypeValue = document.getElementById('hairTypeValue')
const eyeTypeLeft = document.getElementById('eyeTypeLeft')
const eyeTypeRight = document.getElementById('eyeTypeRight')
const eyeTypeValue = document.getElementById('eyeTypeValue')
const mouthTypeLeft = document.getElementById('mouthTypeLeft')
const mouthTypeRight = document.getElementById('mouthTypeRight')
const mouthTypeValue = document.getElementById('mouthTypeValue')
const colorPalettes = document.querySelectorAll('.color-palette')
const faceShapes = ["round","oval","squarechin","rectchin"]
const hairTypes = ["short","bangs","beatles","long","mickey","semi-long","longcurly","lox","medium","curly","ponytail"]
const eyeTypes = ["normal","happy","wink","glasses","angry","kawaii","sunglasses","crying"]
const mouthTypes = ["smile","open","sad","line","none","surprised"]
let faceShapeIndex = faceShapes.indexOf(avatar.faceShape)
let hairTypeIndex = hairTypes.indexOf(avatar.hairType)
let eyeTypeIndex = eyeTypes.indexOf(avatar.eyeType)
let mouthTypeIndex = mouthTypes.indexOf(avatar.mouthType)

function faceShapeToText(val) {
	if (val === "round") return "Rond"
	if (val === "oval") return "Ovale"
	if (val === "squarechin") return "Menton Carré"
	if (val === "rectchin") return "Menton Rectangulaire"
	return "Rond"
}
function hairTypeToText(val) {
	if (val === "short") return "Court"
	if (val === "bangs") return "Bangs"
	if (val === "beatles") return "Beatles"
	if (val === "long") return "Long"
	if (val === "mickey") return "Mickey"
	if (val === "semi-long") return "Semi-Long"
	if (val === "longcurly") return "Long Bouclé"
	if (val === "lox") return "Locks"
	if (val === "medium") return "Medium"
	if (val === "curly") return "Bouclé"
	if (val === "ponytail") return "Queue de cheval"
	return "Mickey"
}
function eyeTypeToText(val) {
	if (val === "normal") return "Normaux"
	if (val === "happy") return "Heureux"
	if (val === "wink") return "Clin d'oeil"
	if (val === "glasses") return "Lunettes"
	if (val === "angry") return "Énervé"
	if (val === "kawaii") return "Kawaii"
	if (val === "sunglasses") return "Solaire"
	if (val === "crying") return "Pleur"
	return "Heureux"
}
function mouthTypeToText(val) {
	if (val === "smile") return "Sourire"
	if (val === "open") return "Normal"
	if (val === "sad") return "Triste"
	if (val === "line") return "Ligne"
	if (val === "none") return "Aucune"
	if (val === "surprised") return "Surpris"
	return "Sourire"
}
faceShapeValue.textContent = faceShapeToText(faceShapes[faceShapeIndex] || "round")
hairTypeValue.textContent = hairTypeToText(hairTypes[hairTypeIndex] || "mickey")
eyeTypeValue.textContent = eyeTypeToText(eyeTypes[eyeTypeIndex] || "happy")
mouthTypeValue.textContent = mouthTypeToText(mouthTypes[mouthTypeIndex] || "smile")

faceShapeLeft.addEventListener('click', () => {
	faceShapeIndex = (faceShapeIndex - 1 + faceShapes.length) % faceShapes.length
	avatar.faceShape = faceShapes[faceShapeIndex]
	faceShapeValue.textContent = faceShapeToText(faceShapes[faceShapeIndex])
	mainAvatarPreview.innerHTML = generateAvatarSVG(avatar, 80)
})
faceShapeRight.addEventListener('click', () => {
	faceShapeIndex = (faceShapeIndex + 1) % faceShapes.length
	avatar.faceShape = faceShapes[faceShapeIndex]
	faceShapeValue.textContent = faceShapeToText(faceShapes[faceShapeIndex])
	mainAvatarPreview.innerHTML = generateAvatarSVG(avatar, 80)
})
hairTypeLeft.addEventListener('click', () => {
	hairTypeIndex = (hairTypeIndex - 1 + hairTypes.length) % hairTypes.length
	avatar.hairType = hairTypes[hairTypeIndex]
	hairTypeValue.textContent = hairTypeToText(hairTypes[hairTypeIndex])
	mainAvatarPreview.innerHTML = generateAvatarSVG(avatar, 80)
})
hairTypeRight.addEventListener('click', () => {
	hairTypeIndex = (hairTypeIndex + 1) % hairTypes.length
	avatar.hairType = hairTypes[hairTypeIndex]
	hairTypeValue.textContent = hairTypeToText(hairTypes[hairTypeIndex])
	mainAvatarPreview.innerHTML = generateAvatarSVG(avatar, 80)
})
eyeTypeLeft.addEventListener('click', () => {
	eyeTypeIndex = (eyeTypeIndex - 1 + eyeTypes.length) % eyeTypes.length
	avatar.eyeType = eyeTypes[eyeTypeIndex]
	eyeTypeValue.textContent = eyeTypeToText(eyeTypes[eyeTypeIndex])
	mainAvatarPreview.innerHTML = generateAvatarSVG(avatar, 80)
})
eyeTypeRight.addEventListener('click', () => {
	eyeTypeIndex = (eyeTypeIndex + 1) % eyeTypes.length
	avatar.eyeType = eyeTypes[eyeTypeIndex]
	eyeTypeValue.textContent = eyeTypeToText(eyeTypes[eyeTypeIndex])
	mainAvatarPreview.innerHTML = generateAvatarSVG(avatar, 80)
})
mouthTypeLeft.addEventListener('click', () => {
	mouthTypeIndex = (mouthTypeIndex - 1 + mouthTypes.length) % mouthTypes.length
	avatar.mouthType = mouthTypes[mouthTypeIndex]
	mouthTypeValue.textContent = mouthTypeToText(mouthTypes[mouthTypeIndex])
	mainAvatarPreview.innerHTML = generateAvatarSVG(avatar, 80)
})
mouthTypeRight.addEventListener('click', () => {
	mouthTypeIndex = (mouthTypeIndex + 1) % mouthTypes.length
	avatar.mouthType = mouthTypes[mouthTypeIndex]
	mouthTypeValue.textContent = mouthTypeToText(mouthTypes[mouthTypeIndex])
	mainAvatarPreview.innerHTML = generateAvatarSVG(avatar, 80)
})
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
	;[...colorPalettes].forEach(palette => createPaletteSwatches(palette))
	avatarMenu.style.display = 'block'
	e.stopPropagation()
})
function createPaletteSwatches(palette) {
	let target = palette.dataset.target
	let colors = []
	if (target === "backgroundColor") {
		return
	} else if (target === "skinColor") {
		colors = ['#F5DEB3', '#D2B48C', '#C3B091', '#A0522D', '#8B4513']
	} else if (target === "bodyColor") {
		colors = ['#444444', '#5c4033', '#625f5f', '#3f3f2f', '#262626', '#6B4423', '#777777', '#2E2E2E', '#36393f']
	} else if (target === "eyeColor") {
		colors = ['#000', '#780501', '#5e420a', '#044004', '#051859', '#570357', '#2b282b', '#4d2c02', '#82561b']
	} else if (target === "hairColor") {
		colors = ['#c2c2c2', '#c9cc06', '#693d00', '#2b250a', '#2e1f05', '#A0522D', '#8B4513', '#888', '#444', '#222', '#000', '#ffff00', '#ffa500', '#b82507', '#008000', '#0000ff', '#800080', '#1d54c2']
	}
	palette.innerHTML = ''
	colors.forEach(c => {
		let sw = document.createElement('div')
		sw.className = 'color-swatch'
		sw.style.backgroundColor = c
		sw.addEventListener('click', () => {
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
