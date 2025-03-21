

settingsIcon.addEventListener('click', e => {
  if (settingsMenu.style.display === 'block') {
    settingsMenu.style.display = 'none';
  } else {
    settingsMenu.style.display = 'block';
    emojiMenu.style.display = 'none';
    mainMenu.style.display = 'none';
    avatarMenu.style.display = 'none';
  }
  e.stopPropagation();
});

document.body.addEventListener('click', e => {
  if (settingsMenu.style.display === 'block' && !settingsMenu.contains(e.target) && e.target !== settingsIcon) {
    settingsMenu.style.display = 'none';
  }
});

document.getElementById('saveProfile').addEventListener('click', () => {
  let data = { username, avatar, conversations, unreadCounts, savedUsers };
  let blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'vivachat_profile.json';
  a.click();
});

document.getElementById('importProfile').addEventListener('click', () => {
  let input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.addEventListener('change', e => {
    let file = e.target.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = evt => {
      try {
        let imported = JSON.parse(evt.target.result);
        if (imported.username) username = imported.username;
        if (imported.avatar) avatar = imported.avatar;
        if (imported.conversations) conversations = imported.conversations;
        if (imported.unreadCounts) unreadCounts = imported.unreadCounts;
        if (imported.savedUsers) savedUsers = imported.savedUsers;
        socket.emit('setUsername', username);
        socket.emit('setAvatar', avatar);
        currentUsernameSpan.textContent = username;
        updateFooterAvatar();
        saveData();
        location.reload();
      } catch (err) {}
    };
    reader.readAsText(file);
  });
  input.click();
});

document.getElementById('deleteProfile').addEventListener('click', () => {
  localStorage.removeItem('username');
  localStorage.removeItem('avatar');
  localStorage.removeItem('conversations');
  localStorage.removeItem('unreadCounts');
  localStorage.removeItem('savedUsers');
  location.reload();
});
