const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

// get element references
const loadProjectButton = document.querySelector("#button-select-path");
const generateButton = document.querySelector("#button-generate");
const destinationButton = document.querySelector("#btn-set-destination");
const projectPathText = document.querySelector("#project-path");
const destinationPathText = document.querySelector("#destination-path");
const saveInBanner = document.querySelector("#save-in-banner")
const maxSize = document.querySelector("#max-size")

loadProjectButton.onclick = () => {
	ipcRenderer.send("load-project", localStorage.getItem("htmlDirectory"));
};

generateButton.onclick = () => {
	ipcRenderer.send("generate-fallbacks", saveInBanner.checked, parseInt(maxSize.value), localStorage.getItem("destinationDirectory"));
};

ipcRenderer.on("project-loaded", (event, arg) => {
	window.localStorage.setItem("htmlDirectory", arg);
	projectPathText.innerHTML = `Project path: ${arg}`;
});

ipcRenderer.on("destination-set", (event, arg) => {
	window.localStorage.setItem("destinationDirectory", arg);
});
