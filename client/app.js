window.addEventListener("storage", e => {
	if (e.key === "primaryTab" && !e.newValue) {
	  location.reload();
	}
  });
  let isPrimary = false;
  if (!localStorage.getItem("primaryTab")) {
	localStorage.setItem("primaryTab", Date.now());
	isPrimary = true;
  }
  window.addEventListener("beforeunload", () => {
	if (isPrimary) localStorage.removeItem("primaryTab");
  });
  if (!isPrimary) {
	document.body.innerHTML =
	  '<div style="text-align:center;color:#fff;margin-top:50px;">Un autre onglet est déjà connecté. Fermez cet onglet.</div>';
  } else {
	window.socket = io("http://176.165.38.138:22453");
	window.username = loadData("username") || randomUsername();
	window.avatar = loadData("avatar") || randomAvatar();
	window.introPhrase = localStorage.getItem("introPhrase") || "";
	window.typingOption =
	  localStorage.getItem("typingOption") === "false" ? false : true;
	window.currentReceiver = null;
	window.currentUsers = [];
	window.usernameMap = {};
	window.avatarMap = {};
	window.conversations = loadData("conversations") || {};
	window.unreadCounts = loadData("unreadCounts") || {};
	window.savedUsers = loadData("savedUsers") || {};
	window.audioEnabled = true;
	const pinnedUsersList = document.getElementById("pinnedUsers");
	const onlineUsersList = document.getElementById("onlineUsers");
	const messagesDiv = document.getElementById("messages");
	const messageBox = document.getElementById("messageBox");
	const sendBtn = document.getElementById("sendBtn");
	const audioToggle = document.getElementById("audioToggle");
	const settingsIcon = document.getElementById("settingsIcon");
	window.currentUsernameSpan = document.getElementById("currentUsername");
	const footerAvatar = document.querySelector(".footer-avatar");
	const mainMenu = document.getElementById("mainMenu");
	window.avatarMenu = document.getElementById("avatarMenu");
	const inviteContainer = document.getElementById("inviteContainer");
	const copyLinkBtn = document.getElementById("copyLinkBtn");
	const notificationSound = document.getElementById("notificationSound");
	function updateFooterAvatar() {
	  footerAvatar.innerHTML = generateAvatarSVG(window.avatar, 30);
	}
	updateFooterAvatar();
	currentUsernameSpan.textContent = window.username;
	disableChatInput(true);
	socket.emit("setUsername", window.username);
	socket.emit("setAvatar", window.avatar);
	socket.emit("setIntro", window.introPhrase);
	socket.on("onlineUsers", users => {
	  window.currentUsers = users;
	  users.forEach(u => {
		window.usernameMap[u.id] = u.username;
		window.avatarMap[u.id] = u.avatar;
		window.savedUsers[u.id] = {
		  username: u.username,
		  avatar: u.avatar,
		  intro: u.intro || ""
		};
	  });
	  const convKeys = Object.keys(window.conversations);
	  const groups = {};
	  convKeys.forEach(key => {
		if (window.savedUsers[key]) {
		  const name = window.savedUsers[key].username;
		  if (!groups[name]) groups[name] = [];
		  groups[name].push(key);
		}
	  });
	  for (const name in groups) {
		const onlineUser = users.find(u => u.username === name);
		let primaryKey = onlineUser ? onlineUser.id : groups[name][0];
		groups[name].forEach(key => {
		  if (key !== primaryKey) {
			if (!window.conversations[primaryKey])
			  window.conversations[primaryKey] = [];
			window.conversations[primaryKey] = window.conversations[primaryKey].concat(
			  window.conversations[key]
			);
			delete window.conversations[key];
			delete window.savedUsers[key];
			if (window.unreadCounts[key]) {
			  window.unreadCounts[primaryKey] =
				(window.unreadCounts[primaryKey] || 0) + window.unreadCounts[key];
			  delete window.unreadCounts[key];
			}
			if (window.currentReceiver === key) {
			  window.currentReceiver = primaryKey;
			}
		  }
		});
	  }
	  if (
		window.currentReceiver &&
		users.find(u => u.id === window.currentReceiver)
	  ) {
		disableChatInput(false);
	  } else if (
		window.currentReceiver &&
		!users.find(u => u.id === window.currentReceiver)
	  ) {
		const lastMsg =
		  window.conversations[window.currentReceiver]?.[
			window.conversations[window.currentReceiver].length - 1
		  ];
		const disconnectedText =
		  (window.savedUsers[window.currentReceiver]
			? window.savedUsers[window.currentReceiver].username
			: "Inconnu") + " s'est déconnecté(e).";
		if (
		  !lastMsg ||
		  lastMsg.sender !== "system" ||
		  lastMsg.text !== disconnectedText
		) {
		  addSystemMessage(window.currentReceiver, disconnectedText);
		}
		disableChatInput(true);
	  }
	  updateLists();
	  saveData();
	});
	socket.on("receiveMessage", data => {
	  if (!window.conversations[data.from])
		window.conversations[data.from] = [];
	  if (data.from !== window.currentReceiver)
		window.unreadCounts[data.from] =
		  (window.unreadCounts[data.from] || 0) + 1;
	  addMessageToConversation(data.from, data.message, "other");
	  if (window.audioEnabled && document.visibilityState === "hidden") {
		notificationSound.play().catch(() => {});
	  }
	  updateLists();
	  saveData();
	});
	socket.on("typing", data => {
	  if (window.currentReceiver === data.from) {
		let typingDiv = document.getElementById("typingIndicator");
		if (!typingDiv) {
		  typingDiv = document.createElement("div");
		  typingDiv.id = "typingIndicator";
		  typingDiv.className = "typing-message";
		  messagesDiv.appendChild(typingDiv);
		  setTimeout(() => {
			const el = document.getElementById("typingIndicator");
			if (el) el.remove();
		  }, 5000);
		}
		typingDiv.innerHTML =
		  '<span>' + data.username + " est en train d'écrire...</span>";
		messagesDiv.scrollTop = messagesDiv.scrollHeight;
	  }
	});
	messageBox.addEventListener("input", () => {
	  if (window.currentReceiver && window.typingOption) {
		socket.emit("typing", { to: window.currentReceiver, username: window.username });
	  }
	});
	audioToggle.addEventListener("click", () => {
	  window.audioEnabled = !window.audioEnabled;
	  if (window.audioEnabled) {
		audioToggle.className = "fa fa-volume-up";
	  } else {
		audioToggle.className = "fa fa-volume-mute";
	  }
	});
	function disableChatInput(disabled) {
	  messageBox.disabled = disabled;
	  sendBtn.disabled = disabled;
	  if (disabled) {
		messageBox.placeholder = "";
		sendBtn.classList.add("disabled");
	  } else {
		sendBtn.classList.remove("disabled");
		messageBox.placeholder = "Tape ton message";
	  }
	}
	function setCurrentReceiver(userId) {
	  window.currentReceiver = userId;
	  window.unreadCounts[userId] = 0;
	  disableChatInput(false);
	  renderConversation(userId);
	  updateLists();
	  saveData();
	  updateTitle();
	}
	function sendMessage() {
	  const text = messageBox.value.trim();
	  if (!text || !window.currentReceiver) return;
	  socket.emit("sendMessage", { to: window.currentReceiver, message: text });
	  addMessageToConversation(window.currentReceiver, text, "me");
	  messageBox.value = "";
	  saveData();
	  updateTitle();
	  updateLists();
	}
	sendBtn.onclick = () => sendMessage();
	messageBox.addEventListener("keypress", e => {
	  if (e.key === "Enter") sendMessage();
	});
	function addMessageToConversation(partnerId, text, sender) {
	  const time = new Date();
	  if (!window.conversations[partnerId]) window.conversations[partnerId] = [];
	  window.conversations[partnerId].push({ sender, text, time, animated: false });
	  if (window.currentReceiver === partnerId) renderConversation(partnerId);
	}
	function addSystemMessage(partnerId, msg) {
	  if (!window.conversations[partnerId]) window.conversations[partnerId] = [];
	  window.conversations[partnerId].push({
		sender: "system",
		text: msg,
		time: new Date(),
		animated: false
	  });
	  if (window.currentReceiver === partnerId) renderConversation(partnerId);
	}
	function renderConversation(partnerId) {
	  messagesDiv.innerHTML = "";
	  const partnerName =
		window.usernameMap[partnerId] ||
		(window.savedUsers[partnerId] ? window.savedUsers[partnerId].username : "Inconnu");
	  const infoDiv = document.createElement("div");
	  infoDiv.className = "conversation-info";
	  infoDiv.innerHTML =
		'<i class="fa fa-info-circle"></i><span>Vous discutez maintenant avec ' +
		partnerName +
		".</span>";
	  messagesDiv.appendChild(infoDiv);
	  const partnerIntro = window.savedUsers[partnerId]
		? window.savedUsers[partnerId].intro
		: "";
	  if (partnerIntro && partnerIntro.trim() !== "") {
		const introDiv = document.createElement("div");
		introDiv.className = "conversation-intro";
		introDiv.textContent = '"' + partnerIntro + '"';
		messagesDiv.appendChild(introDiv);
	  }
	  let prevSender = null;
	  let block;
	  let chainCount = 0;
	  window.conversations[partnerId]?.forEach(msg => {
		if (msg.sender === "system") {
		  const sys = document.createElement("div");
		  sys.className = "system-message";
		  sys.innerHTML =
			'<i class="fa fa-tower-broadcast"></i><span>' + msg.text + "</span>";
		  messagesDiv.appendChild(sys);
		  prevSender = "system";
		  chainCount = 0;
		  block = null;
		  return;
		}
		const formattedTime =
		  ("0" + new Date(msg.time).getHours()).slice(-2) +
		  ":" +
		  ("0" + new Date(msg.time).getMinutes()).slice(-2);
		if (msg.sender !== prevSender || chainCount >= 10) {
		  chainCount = 1;
		  block = document.createElement("div");
		  block.className =
			"message-block " + (msg.sender === "me" ? "msg-me" : "msg-other");
		  const header = document.createElement("div");
		  header.className = "message-header";
		  const avatarDiv = document.createElement("div");
		  avatarDiv.className = "message-avatar";
		  if (msg.sender === "me") {
			avatarDiv.innerHTML = generateAvatarSVG(window.avatar, 45);
		  } else {
			avatarDiv.innerHTML = generateAvatarSVG(
			  window.avatarMap[partnerId] ||
				(window.savedUsers[partnerId]
				  ? window.savedUsers[partnerId].avatar
				  : null),
			  45
			);
		  }
		  const meta = document.createElement("div");
		  meta.className = "message-meta";
		  const uname = document.createElement("span");
		  uname.className = "message-username";
		  uname.textContent = msg.sender === "me" ? window.username : partnerName;
		  const timeSpan = document.createElement("span");
		  timeSpan.className = "message-time";
		  timeSpan.textContent = formattedTime;
		  meta.appendChild(uname);
		  meta.appendChild(timeSpan);
		  header.appendChild(avatarDiv);
		  header.appendChild(meta);
		  block.appendChild(header);
		  const bubble = document.createElement("div");
		  bubble.className = "message-bubble";
		  bubble.textContent = msg.text;
		  if (!msg.animated) {
			bubble.classList.add("fade-in");
			msg.animated = true;
		  }
		  block.appendChild(bubble);
		  messagesDiv.appendChild(block);
		} else {
		  chainCount++;
		  const bubble = document.createElement("div");
		  bubble.className = "message-bubble";
		  bubble.textContent = msg.text;
		  if (!msg.animated) {
			bubble.classList.add("fade-in");
			msg.animated = true;
		  }
		  block.appendChild(bubble);
		}
		prevSender = msg.sender;
	  });
	  messagesDiv.scrollTop = messagesDiv.scrollHeight;
	}
	function updateLists() {
	  pinnedUsersList.innerHTML = "";
	  onlineUsersList.innerHTML = "";
	  const pinnedIds = Object.keys(window.conversations).filter(
		id => id !== socket.id
	  );
	  pinnedIds.sort((a, b) => {
		let aOnline = window.currentUsers.find(u => u.id === a) ? 1 : 0;
		let bOnline = window.currentUsers.find(u => u.id === b) ? 1 : 0;
		return bOnline - aOnline;
	  });
	  const pinnedCount = pinnedIds.length;
	  if (pinnedCount > 0) {
		document.querySelector(".pinned-header .title").textContent = "";
		document.querySelector(".pinned-header").style.display = "block";
		pinnedUsersList.style.display = "block";
	  } else {
		document.querySelector(".pinned-header").style.display = "none";
		pinnedUsersList.style.display = "none";
	  }
	  pinnedIds.forEach(id => {
		createListItem(id, pinnedUsersList, true);
	  });
	  let onlineCount = 0;
	  window.currentUsers.forEach(u => {
		if (u.id !== socket.id && !pinnedIds.includes(u.id)) {
		  createListItem(u.id, onlineUsersList, false);
		  onlineCount++;
		}
	  });
	  if (onlineCount === 0) {
		inviteContainer.style.display = "block";
	  } else {
		inviteContainer.style.display = "none";
	  }
	  updateTitle();
	}
	function createListItem(id, container, isPinned) {
	  const li = document.createElement("li");
	  li.dataset.id = id;
	  const name =
		window.usernameMap[id] ||
		(window.savedUsers[id] ? window.savedUsers[id].username : "Inconnu");
	  let statusHTML = "";
	  if (isPinned) {
		if (window.currentUsers.find(u => u.id === id)) {
		  statusHTML = '<div class="user-status online">En ligne</div>';
		} else {
		  statusHTML = '<div class="user-status offline">Déconnecté(e)</div>';
		}
	  }
	  const userAvatar =
		window.avatarMap[id] || (window.savedUsers[id] ? window.savedUsers[id].avatar : null);
	  const userAvatarHTML = userAvatar ? generateAvatarSVG(userAvatar, 30) : "";
	  li.innerHTML =
		'<div class="user-item"><div class="user-avatar"><div class="avatar-image">' +
		userAvatarHTML +
		'</div></div><div class="user-info-box"><div class="user-name">' +
		name +
		"</div>" +
		statusHTML +
		'</div><span class="notif" style="display:none;"></span></div>';
	  const itemDiv = li.querySelector(".user-item");
	  if (id === window.currentReceiver) itemDiv.classList.add("selected");
	  const notifSpan = itemDiv.querySelector(".notif");
	  if (window.unreadCounts[id]) {
		notifSpan.dataset.count = window.unreadCounts[id];
		notifSpan.textContent = window.unreadCounts[id];
		notifSpan.style.display = "flex";
	  }
	  if (isPinned) {
		let avatarDiv = li.querySelector(".user-avatar");
		let avatarImage = li.querySelector(".avatar-image");
		avatarDiv.style.position = "relative";
		avatarDiv.addEventListener("mouseenter", () => {
		  avatarImage.style.filter = "blur(4px)";
		  let closeIcon = document.createElement("span");
		  closeIcon.className = "fa fa-times close-icon";
		  closeIcon.style.position = "absolute";
		  closeIcon.style.top = "7px";
		  closeIcon.style.right = "9px";
		  closeIcon.style.color = "red";
		  closeIcon.style.fontSize = "18px";
		  closeIcon.style.cursor = "pointer";
		  closeIcon.style.zIndex = "10";
		  closeIcon.addEventListener("click", e => {
			e.stopPropagation();
			delete window.conversations[id];
			delete window.unreadCounts[id];
			if (id === window.currentReceiver) {
			  window.currentReceiver = null;
			  messagesDiv.innerHTML = "";
			  disableChatInput(true);
			}
			updateLists();
			saveData();
		  });
		  avatarDiv.appendChild(closeIcon);
		});
		avatarDiv.addEventListener("mouseleave", () => {
		  avatarImage.style.filter = "";
		  let closeIcon = avatarDiv.querySelector(".close-icon");
		  if (closeIcon) closeIcon.remove();
		});
	  }
	  li.addEventListener("mousedown", e => {
		if (e.button !== 0) return;
		li._timeout = setTimeout(() => {
		  if (isPinned) {
			delete window.conversations[id];
			delete window.unreadCounts[id];
			if (id === window.currentReceiver) {
			  window.currentReceiver = null;
			  messagesDiv.innerHTML = "";
			  disableChatInput(true);
			}
			updateLists();
			saveData();
		  }
		}, 1000);
	  });
	  li.addEventListener("mouseup", () => clearTimeout(li._timeout));
	  li.addEventListener("mouseleave", () => clearTimeout(li._timeout));
	  li.addEventListener("click", () => {
		if (!li._timeout) return;
		clearTimeout(li._timeout);
		li._timeout = null;
		setCurrentReceiver(id);
	  });
	  container.appendChild(li);
	}
	function updateTitle() {
	  let count = Object.keys(window.unreadCounts).filter(
		key => window.unreadCounts[key] > 0
	  ).length;
	  if (count > 0) {
		document.title = "(" + count + ") VivaChat";
	  } else {
		document.title = "VivaChat";
	  }
	}
	copyLinkBtn.addEventListener("click", () => {
	  navigator.clipboard.writeText(window.location.href);
	  copyLinkBtn.textContent = "Lien copié";
	  setTimeout(() => {
		copyLinkBtn.textContent = "Copier le lien";
	  }, 4000);
	});
	function randomUsername() {
	  return "Stranger" + Math.floor(1000 + Math.random() * 9000);
	}
	function saveData() {
	  localStorage.setItem("username", window.username);
	  localStorage.setItem("avatar", JSON.stringify(window.avatar));
	  localStorage.setItem("conversations", JSON.stringify(window.conversations));
	  localStorage.setItem("unreadCounts", JSON.stringify(window.unreadCounts));
	  localStorage.setItem("savedUsers", JSON.stringify(window.savedUsers));
	}
	function loadData(key) {
	  const d = localStorage.getItem(key);
	  if (d) {
		if (
		  key === "conversations" ||
		  key === "unreadCounts" ||
		  key === "avatar" ||
		  key === "savedUsers"
		) {
		  return JSON.parse(d);
		}
		return d;
	  }
	  return null;
	}
	document.addEventListener("click", function unlockAudio() {
	  const originalVolume = notificationSound.volume;
	  notificationSound.volume = 0;
	  notificationSound
		.play()
		.then(() => {
		  notificationSound.pause();
		  notificationSound.currentTime = 0;
		  notificationSound.volume = originalVolume;
		  document.removeEventListener("click", unlockAudio);
		})
		.catch(() => {
		  notificationSound.volume = originalVolume;
		  document.removeEventListener("click", unlockAudio);
		});
	});
	document.body.addEventListener("click", e => {
	  if (
		mainMenu.style.display === "block" &&
		!mainMenu.contains(e.target) &&
		!avatarMenu.contains(e.target) &&
		e.target !== userInfo
	  ) {
		let newUsername = menuUsername.value.trim() || username;
		if (newUsername.length > 16) {
		  newUsername = newUsername.substring(0, 16);
		}
		username = newUsername;
		let newIntro = menuIntro.value.trim().substring(0, 100);
		localStorage.setItem("introPhrase", newIntro);
		window.introPhrase = newIntro;
		let newTypingOption = menuTypingOption.checked;
		localStorage.setItem("typingOption", newTypingOption);
		window.typingOption = newTypingOption;
		socket.emit("setUsername", username);
		socket.emit("setIntro", newIntro);
		currentUsernameSpan.textContent = username;
		canEdit = false;
		saveData();
		mainMenu.style.display = "none";
	  }
	});
  }
  