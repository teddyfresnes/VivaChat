function randomAvatar() {
	return {
		backgroundColor: '#7289da',
		bodyColor: '#444444',
		skinColor: '#fff',
		faceShape: 'round',
		eyeType: 'happy',
		eyeColor: '#000000',
		mouthType: 'smile',
		hairType: 'mickey',
		hairColor: '#fff'
	}
}

function generateAvatarSVG(conf, size) {
	const bg = conf ? conf.backgroundColor : '#7289da'
	const bodyC = conf ? conf.bodyColor : '#444444'
	const face = conf ? conf.faceShape : 'round'
	const skinC = conf ? conf.skinColor : '#ffffff'
	const eye = conf ? conf.eyeType : 'normal'
	const eyeC = conf ? conf.eyeColor : '#000000'
	const mouth = conf ? conf.mouthType : 'smile'
	const hair = conf ? conf.hairType : 'short'
	const hairC = conf ? conf.hairColor : '#ffffff'
	const bodyPath = '<rect x="30" y="80" width="40" height="20" fill="' + bodyC + '" rx="8" ry="8"/>'
	let facePath = ''
	if (face === 'round') {
		facePath = '<path d="M50 20 C70 20 80 35 80 50 C80 65 70 80 50 80 C30 80 20 65 20 50 C20 35 30 20 50 20Z" fill="' + skinC + '"/>'
	} else if (face === 'oval') {
		facePath = '<path d="M50 20 C70 20 80 35 80 45 C80 65 65 80 50 80 C35 80 20 65 20 45 C20 35 30 20 50 20Z" fill="' + skinC + '"/>'
	} else if (face === 'squarechin') {
		facePath = '<path d="M50 20 C70 20 80 35 80 45 L80 60 C80 70 65 80 50 80 C35 80 20 70 20 60 L20 45 C20 35 30 20 50 20Z" fill="' + skinC + '"/>'
	} else if (face === 'rectchin') {
		facePath = '<path d="M50 20 C70 20 80 35 80 45 L80 65 C80 75 65 80 50 80 C35 80 20 75 20 65 L20 45 C20 35 30 20 50 20Z" fill="' + skinC + '"/>'
	}
	let eyePath = ''
	if (eye === 'normal') {
		eyePath = '<g><circle cx="35" cy="50" r="10" fill="#FFF" stroke="#000" stroke-width="2"/><circle cx="35" cy="50" r="5" fill="' + eyeC + '"/><circle cx="37" cy="48" r="2" fill="#FFF"/><circle cx="65" cy="50" r="10" fill="#FFF" stroke="#000" stroke-width="2"/><circle cx="65" cy="50" r="5" fill="' + eyeC + '"/><circle cx="67" cy="48" r="2" fill="#FFF"/></g>'
	} else if (eye === 'happy') {
		eyePath = '<path d="M34 50 C38 45 42 45 46 50" stroke="#000" stroke-width="2" fill="none"/><path d="M54 50 C58 45 62 45 66 50" stroke="#000" stroke-width="2" fill="none"/>'
	} else if (eye === 'wink') {
		eyePath = '<circle cx="40" cy="48" r="8" fill="#FFF" stroke="#000" stroke-width="2"/><circle cx="40" cy="48" r="4" fill="' + eyeC + '"/><circle cx="43" cy="45" r="2" fill="#FFF"/><path d="M55 50 Q61 42 67 50" stroke="#000" stroke-width="3" fill="none"/>'
	} else if (eye === 'glasses') {
		eyePath = '<circle cx="40" cy="48" r="8" fill="#FFF" stroke="#000" stroke-width="2"/><circle cx="40" cy="48" r="4" fill="' + eyeC + '"/><circle cx="60" cy="48" r="8" fill="#FFF" stroke="#000" stroke-width="2"/><circle cx="60" cy="48" r="4" fill="' + eyeC + '"/><line x1="48" y1="48" x2="52" y2="48" stroke="#000" stroke-width="2"/><line x1="32" y1="48" x2="28" y2="46" stroke="#000" stroke-width="2"/><line x1="68" y1="48" x2="72" y2="46" stroke="#000" stroke-width="2"/>'
	} else if (eye === 'angry') {
		eyePath = '<circle cx="35" cy="50" r="10" fill="#FFF" stroke="#000" stroke-width="2"/><circle cx="35" cy="50" r="5" fill="' + eyeC + '"/><circle cx="37" cy="48" r="2" fill="#FFF"/><circle cx="65" cy="50" r="10" fill="#FFF" stroke="#000" stroke-width="2"/><circle cx="65" cy="50" r="5" fill="' + eyeC + '"/><circle cx="67" cy="48" r="2" fill="#FFF"/><path d="M30,40 L50,50 L70,40" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'
	} else if (eye === 'kawaii') {
		eyePath = '<circle cx="35" cy="50" r="12" fill="#FFF" stroke="#000" stroke-width="2"/><circle cx="35" cy="50" r="7" fill="#000"/><circle cx="32" cy="48" r="3" fill="#FFF"/><circle cx="38" cy="52" r="1.5" fill="#FFF"/><circle cx="65" cy="50" r="12" fill="#FFF" stroke="#000" stroke-width="2"/><circle cx="65" cy="50" r="7" fill="#000"/><circle cx="62" cy="48" r="3" fill="#FFF"/><circle cx="68" cy="52" r="1.5" fill="#FFF"/><path d="M28,43 Q31,40 34,43" stroke="#FFB3BA" stroke-width="1.5" fill="none"/><path d="M58,43 Q61,40 64,43" stroke="#FFB3BA" stroke-width="1.5" fill="none"/>'
	} else if (eye === 'sunglasses') {
		eyePath = '<ellipse cx="40" cy="48" rx="9" ry="6" fill="#333" stroke="#000" stroke-width="2"/><ellipse cx="60" cy="48" rx="9" ry="6" fill="#333" stroke="#000" stroke-width="2"/><path d="M49,48 Q50,46 51,48" stroke="#000" stroke-width="2" fill="none"/><line x1="31" y1="48" x2="26" y2="42" stroke="#000" stroke-width="2"/><line x1="69" y1="48" x2="72" y2="42" stroke="#000" stroke-width="2"/>'
	} else if (eye === 'crying') {
		eyePath = '<circle cx="35" cy="50" r="10" fill="#FFF" stroke="#000" stroke-width="2"/><circle cx="35" cy="50" r="5" fill="' + eyeC + '"/><circle cx="33" cy="48" r="2" fill="#FFF"/><circle cx="37" cy="52" r="1.5" fill="#FFF"/><path d="M35 60 C33 65 37 65 35 70" stroke="#00f" stroke-width="2" fill="none"/><circle cx="65" cy="50" r="10" fill="#FFF" stroke="#000" stroke-width="2"/><circle cx="65" cy="50" r="5" fill="' + eyeC + '"/><circle cx="63" cy="48" r="2" fill="#FFF"/><circle cx="67" cy="52" r="1.5" fill="#FFF"/><path d="M65 60 C63 65 67 65 65 70" stroke="#00f" stroke-width="2" fill="none"/>'
	}
	let mouthPath = ''
	if (mouth === 'smile') {
		mouthPath = '<path d="M38 60 Q50 70 62 60" fill="none" stroke="#000" stroke-width="2"/>'
	} else if (mouth === 'open') {
		mouthPath = '<path d="M40 65 Q50 68 60 65" fill="none" stroke="#000" stroke-width="2"/>'
	} else if (mouth === 'sad') {
		mouthPath = '<path d="M38 65 Q50 55 62 65" fill="none" stroke="#000" stroke-width="2"/>'
	} else if (mouth === 'line') {
		mouthPath = '<line x1="38" y1="65" x2="62" y2="65" stroke="#000" stroke-width="2"/>'
	} else if (mouth === 'none') {
		mouthPath = ''
	} else if (mouth === 'surprised') {
		mouthPath = '<circle cx="50" cy="65" r="4" fill="none" stroke="#000" stroke-width="2"/>'
	}
	let hairPath = ''
	if (hair === 'short') {
		hairPath = '<path d="M30 20 C35 10 65 10 70 20 C70 27 65 30 50 30 C35 30 30 27 30 20Z" fill="' + hairC + '"/>'
	} else if (hair === 'bangs') {
		hairPath = '<path d="M30 20 C40 5 60 5 70 20 C67 28 63 25 50 25 C37 25 33 28 30 20Z" fill="' + hairC + '"/>'
	} else if (hair === 'beatles') {
		hairPath = '<path d="M25 20 C30 0 70 0 75 20 L75 35 C70 40 30 40 25 35Z" fill="' + hairC + '"/>'
	} else if (hair === 'long') {
		hairPath = '<path d="M50,10 C20,15 15,40 15,90 M49,10 C80,15 85,40 85,90 M30,20 C40,18 60,18 70,20 M15,40 C25,30 35,25 50,25 M85,40 C75,30 65,25 50,25" fill="none" stroke="' + hairC + '" stroke-width="8"/>'
	} else if (hair === 'mickey') {
		hairPath = '<circle cx="35" cy="25" r="10" fill="' + hairC + '"/><circle cx="65" cy="25" r="10" fill="' + hairC + '"/>'
	} else if (hair === 'semi-long') {
		hairPath = '<path fill-rule="evenodd" d="M15,65 C15,35 20,10 50,5 80,10 85,35 85,65 70,85 30,85 15,65 Z M50,20 C70,20 80,35 80,50 80,65 70,80 50,80 30,80 20,65 20,50 20,35 30,20 50,20Z" fill="' + hairC + '"/>'
	} else if (hair === 'longcurly') {
		hairPath = '<path d="M50,10 C20,15 15,40 15,90 Q20,80 15,70 Q20,60 15,50 Q20,40 15,30 M50,10 C80,15 85,40 85,90 Q80,80 85,70 Q80,60 85,50 Q80,40 85,30 M30,20 C40,18 60,18 70,20 M15,40 C25,30 35,25 50,25 M85,40 C75,30 65,25 50,25" fill="none" stroke="' + hairC + '" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>'
	} else if (hair === 'lox') {
		hairPath = '<path d="M50,20 C40,15 30,10 30,20 Q35,25 30,30 Q35,35 30,40 M50,20 C60,15 70,10 70,20 Q65,25 70,30 Q65,35 70,40 M40,25 C45,20 55,20 60,25 M60,25 C55,20 45,20 40,25 M25,25 C30,20 35,15 40,20 M75,25 C70,20 65,15 60,20" fill="none" stroke="' + hairC + '" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>'
	} else if (hair === 'medium') {
		hairPath = '<path d="M20,65 C15,45 20,15 50,10 C80,15 85,45 80,65 Q75,55 70,45 Q65,35 50,35 Q35,35 30,45 Q25,55 20,65 Z" fill="' + hairC + '"/>'
	} else if (hair === 'curly') {
		hairPath = '<path d="M20,60 C15,20 20,20 40,25 80,20 85,45 80,60 M22,28 Q20,23 25,18 M25,15 Q30,25 25,20 M28,32 Q33,27 28,22 M35,25 Q40,20 35,15 M45,20 Q50,15 45,10 M55,20 Q60,15 55,10 M65,25 Q70,20 65,15 M72,28 Q77,23 72,18 M75,30 Q80,25 75,20 M78,32 Q83,27 78,22 M40,18 Q45,13 40,8 M50,15 Q55,10 50,5 M60,18 Q65,13 60,8" fill="none" stroke="' + hairC + '" stroke-width="10" stroke-linecap="round"/>'
	} else if (hair === 'ponytail') {
		hairPath = '<path d="M15,80 C15,45 20,15 50,10 80,15 85,45 85,80 C75,40 70,30 50,30 30,30 25,40 15,80 Z" fill="' + hairC + '"/><path d="M35,15 Q30,10 25,15 Q30,20 35,15 M45,12 Q40,7 35,12 Q40,17 45,12 M55,12 Q50,7 45,12 Q50,17 55,12 M65,15 Q60,10 55,15 Q60,20 65,15" fill="none" stroke="' + hairC + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'
	}
	return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><rect width="100" height="100" fill="' + bg + '"/>' + bodyPath + facePath + hairPath + eyePath + mouthPath + '</svg>'
}
