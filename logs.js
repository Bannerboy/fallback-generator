const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

ipcRenderer.on('log', (event, arg) => {
  let listItems = arg.map(line => {
    return `<li class="log">${line}</li>`;
  });
  document.body.innerHTML += `<ul>${listItems.join(' ')}</ul>`;
});
