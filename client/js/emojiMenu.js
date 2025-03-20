

emojiBtn.addEventListener('click', () => {
  if (emojiMenu.style.display === 'none') {
    emojiMenu.style.display = 'block';
    settingsMenu.style.display = 'none';
    mainMenu.style.display = 'none';
    loadEmojis();
  } else {
    emojiMenu.style.display = 'none';
  }
});

emojiMenu.addEventListener('click', e => {
  if (e.target.classList.contains('emoji')) {
    messageBox.value += e.target.textContent;
    emojiMenu.style.display = 'none';
  }
});

function loadEmojis() {
  if (emojiMenu.innerHTML.trim() === '') {
    const emojis = ["😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", "😋", "😎", "😍", "😘", "😗", "😙", "😚", "🙂", "🤗", "🤔", "😐", "😑", "😶", "🙄", "😏", "😣", "😥", "😮", "🤐", "😯", "😪", "😫", "😴", "😌", "😛", "😜", "😝", "🤤", "😒", "😓", "😔", "😕", "🙃", "🤑", "😲", "☹️", "🙁", "😖", "😞", "😟", "😤", "😢", "😭", "😦", "😧", "😨", "😩", "🤯", "😬", "😰", "😱", "🥵", "🥶", "😳", "🤪", "😵", "😡", "😠", "🤬", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "😇", "🥳", "🥺", "🤠", "🤡", "🤥", "🤫", "🤭", "🧐", "🤓", "😈", "👿", "👹", "👺", "💀", "☠️", "👻", "👽", "👾", "🤖", "💩", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾"];
    emojiMenu.innerHTML = emojis.map(emoji => `<span class="emoji">${emoji}</span>`).join('');
  }
}
